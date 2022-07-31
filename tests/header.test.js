// run npm run test and this would execute
test('Adds two numbers', ()=>{
    const sum = 1 + 2;
    expect(sum).toEqual(3);
});


// Add this after main if faced with issue: SecurityError: localStorage is not available for opaque origins
// "jest": {
//     "verbose": true,
//     "testURL": "http://localhost:3000/"
//   },