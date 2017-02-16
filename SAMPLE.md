# Sample Output

Running the tests in `examples/fibonacci-bench.js`, we get the following (truncated) output in `results.txt` ...

```
Recursive
	Command being timed: "/usr/bin/node --prof --turbo --max_inlined_source_size=700 ./fixtures/fibonacciR.js 40"
	User time (seconds): 2.96
	System time (seconds): 0.10
	Percent of CPU this job got: 100%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:03.05
	... more data ...
  
Dynamic
	Command being timed: "/usr/bin/node --prof --turbo --max_inlined_source_size=700 ./fixtures/fibonacciDP.js 40"
	User time (seconds): 0.06
	System time (seconds): 0.01
	Percent of CPU this job got: 97%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.08
	... more data ...
  
Dynamic2
	Command being timed: "/usr/bin/node --prof --turbo --max_inlined_source_size=700 ./fixtures/fibonacciDP2.js 40"
	User time (seconds): 0.07
	System time (seconds): 0.01
	Percent of CPU this job got: 97%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.08
	... more data ...
  
```

The `results.txt` is like the symptom catcher. We see that the two Dynamic tests dominate the Recursive test in terms of speed.

Let's examine the generated `profile-*.txt` files to diagnose why.

Recursive (`profile-Recursive.txt`):

```
 [JavaScript]:
   ticks  total  nonlib   name
   1819   77.0%   77.0%  LazyCompile: *fibonacci /Users/Ammar/Desktop/quasimodo/examples/fixtures/fibonacciR.js:3:19
    289   12.2%   12.2%  Stub: StrictEqualStub
    108    4.6%    4.6%  Stub: AddStub

...

 [Summary]:
   ticks  total  nonlib   name
   2216   93.9%   93.9%  JavaScript
     69    2.9%    2.9%  C++
      9    0.4%    0.4%  GC
      0    0.0%          Shared libraries
     76    3.2%          Unaccounted

...

 [Bottom up (heavy) profile]:
  Note: percentage shows a share of a particular caller in the total
  amount of its parent calls.
  Callers occupying less than 2.0% are not shown.

   ticks parent  name
   1819   77.0%  LazyCompile: *fibonacci /Users/Ammar/Desktop/quasimodo/examples/fixtures/fibonacciR.js:3:19
   1819  100.0%    LazyCompile: *fibonacci /Users/Ammar/Desktop/quasimodo/examples/fixtures/fibonacciR.js:3:19
   1819  100.0%      LazyCompile: *fibonacci /Users/Ammar/Desktop/quasimodo/examples/fixtures/fibonacciR.js:3:19
   1819  100.0%        LazyCompile: *fibonacci /Users/Ammar/Desktop/quasimodo/examples/fixtures/fibonacciR.js:3:19
   1819  100.0%          LazyCompile: *fibonacci /Users/Ammar/Desktop/quasimodo/examples/fixtures/fibonacciR.js:3:19
   1819  100.0%            LazyCompile: *fibonacci /Users/Ammar/Desktop/quasimodo/examples/fixtures/fibonacciR.js:3:19
   
... 

 ```
 
 As you can see, the Javascript code here is the bottleneck. The `fibonacci` function gets lazy-compiled by the v8 engine repeatedly.
 
 If we examine `examples/fixtures/fibonacciR.js`, the `fibonacci` function has a branching factor of 2; it gets called twice for every one time it gets called. This gives it an exponentially growing time complexity (`O(2^n)`).
 
 Now let's look at a Dynamic fibonacci algorithm (`profile-Dynamic.txt`):
 
 ```
 [JavaScript]:
   ticks  total  nonlib   name
      1    1.7%    1.7%  Stub: CEntryStub

 [C++]:
   ticks  total  nonlib   name
     17   28.3%   28.3%  node::ContextifyScript::New(v8::FunctionCallbackInfo<v8::Value> const&)
      3    5.0%    5.0%  node::Binding(v8::FunctionCallbackInfo<v8::Value> const&)
      3    5.0%    5.0%  _semctl
      2    3.3%    3.3%  void v8::internal::Scanner::Advance<false, true>()
      2    3.3%    3.3%  v8::internal::Scanner::ScanIdentifierOrKeyword()
 
 ...

 [Summary]:
   ticks  total  nonlib   name
      1    1.7%    1.7%  JavaScript
     44   73.3%   73.3%  C++
      2    3.3%    3.3%  GC
      0    0.0%          Shared libraries
     15   25.0%          Unaccounted

...

[Bottom up (heavy) profile]:
  Note: percentage shows a share of a particular caller in the total
  amount of its parent calls.
  Callers occupying less than 2.0% are not shown.

   ticks parent  name
     17   28.3%  node::ContextifyScript::New(v8::FunctionCallbackInfo<v8::Value> const&)
     17  100.0%    v8::internal::Builtin_HandleApiCallConstruct(int, v8::internal::Object**, v8::internal::Isolate*)
     17  100.0%      LazyCompile: ~runInThisContext bootstrap_node.js:403:28
     17  100.0%        LazyCompile: NativeModule.compile bootstrap_node.js:485:44
     17  100.0%          LazyCompile: ~NativeModule.require bootstrap_node.js:419:34
      6   35.3%            LazyCompile: ~startup bootstrap_node.js:12:19
      2   11.8%            LazyCompile: ~setupGlobalVariables bootstrap_node.js:202:32
      2   11.8%            Function: ~<anonymous> util.js:1:11
      2   11.8%            Function: ~<anonymous> stream.js:1:11
      2   11.8%            Function: ~<anonymous> module.js:1:11
      1    5.9%            LazyCompile: ~setupGlobalTimeouts bootstrap_node.js:230:31
      1    5.9%            Function: ~<anonymous> timers.js:1:11
      1    5.9%            Function: <anonymous> fs.js:1:11

...

```

In this solution, not only is Javascript not the bottleneck, the overall number of CPU ticks consumed by the algorithm is MUCH lower than the Recursive test!

A quick look at `examples/fixtures/fibonacciDP.js` will show why. The solution runs in linear time (`O(n)`), maintains previously computed values as integers in an array, and iterates from `2 -> n`.

These features not only make this solution the more efficient solution in almost ANY programming environment, but it also lets v8 optimize the shit out of it!

- We initialize the cache array with two integers, tipping off v8 that this will probably be a list of Integers.
- We iterate from `2 -> n`, which gives us a very tight loop of computation.
- We return the already-computed `n`th value in our cache (instead of doing a `return cache[cache.length - 1]`
