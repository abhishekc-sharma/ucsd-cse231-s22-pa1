import { run } from '../runner';
import { expect } from 'chai';
import 'mocha';

const importObject = {
  imports: {
    // we typically define print to mean logging to the console. To make testing
    // the compiler easier, we define print so it logs to a string object.
    //  We can then examine output to see what would have been printed in the
    //  console.
    print: (arg : any) => {
      importObject.output += arg;
      importObject.output += "\n";
      return arg;
    },

    abs: (arg : any) => {
      return Math.abs(arg);
    },

    min: (arg1: any, arg2: any) => {
      return Math.min(arg1, arg2);
    },

    max: (arg1: any, arg2: any) => {
      return Math.max(arg1, arg2);
    },

    pow: (arg1: any, arg2: any) => {
      return Math.pow(arg1, arg2);
    }
  },

  output: ""
};

// Clear the output before every test
beforeEach(function () {
  importObject.output = "";
});
  
// We write end-to-end tests here to make sure the compiler works as expected.
// You should write enough end-to-end tests until you are confident the compiler
// runs as expected. 
describe('run(source, config) function', () => {
  const config = { importObject };
  
  // We can test the behavior of the compiler in several ways:
  // 1- we can test the return value of a program
  // Note: since run is an async function, we use await to retrieve the 
  // asynchronous return value. 
  it('returns the right number', async () => {
    const result = await run("987", config);
    expect(result).to.equal(987);
  });

  // 2- we can test the behavior of the compiler by also looking at the log 
  // resulting from running the program
  it('prints something right', async() => {
    var result = await run("print(1337)", config);
    expect(result).to.equal(1337);
    expect(config.importObject.output).to.equal("1337\n");
  });

  // 3- we can also combine both type of assertions, or feel free to use any 
  // other assertions provided by chai.
  it('prints two numbers but returns last one', async () => {
    var result = await run("print(987)", config);
    expect(result).to.equal(987);
    result = await run("print(123)", config);
    expect(result).to.equal(123);
    
    expect(config.importObject.output).to.equal("987\n123\n");
  });

  // Note: it is often helpful to write tests for a functionality before you
  // implement it. You will make this test pass!
  it('adds two numbers', async() => {
    const result = await run("2 + 3", config);
    expect(result).to.equal(5);
  });

  it('pow two numbers overflow truncates', async() => {
    const result = await run("pow(2, 32)", config);
    expect(result).to.equal(0);
  });

  it('substracts two numbers', async() => {
    const result = await run("2 - 3", config);
    expect(result).to.equal(-1);
  });

  it('abs of a number', async() => {
    const result = await run("abs(1 - 2)", config);
    expect(result).to.equal(1);
  });

  it('max of two numbers', async() => {
    const result = await run("max(100, 120)", config);
    expect(result).to.equal(120);
  });

  it('min of two numbers', async() => {
    const result = await run("min(100, 120)", config);
    expect(result).to.equal(100);
  });

  it('pow of two numbers', async() => {
    const result = await run("pow(2, 10)", config);
    expect(result).to.equal(1024);
  });

  it('sequence of expressions and assignments 1', async() => {
    const result = await run("x = abs(-1)\ny = max(1025, pow(2, 10))\nprint(x + y)", config) 
    expect(result).to.equal(1026);
  });

  // TODO: add additional tests here to ensure the compiler runs as expected
});
