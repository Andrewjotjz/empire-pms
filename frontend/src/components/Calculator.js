import { useState } from "react";

const Calculator = () => {
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [operation, setOperation] = useState("+");
  const [result, setResult] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);

  const calculate = () => {
    const a = parseFloat(num1);
    const b = parseFloat(num2);

    if (isNaN(a) || isNaN(b)) {
      setResult("Please enter valid numbers.");
      return;
    }

    let res;
    switch (operation) {
      case "+":
        res = a + b;
        break;
      case "-":
        res = a - b;
        break;
      case "*":
        res = a * b;
        break;
      case "/":
        res = b !== 0 ? a / b : "Cannot divide by zero";
        break;
      default:
        res = "Invalid operation";
    }

    setResult(res);
  };

  return (
    showCalculator ? 
    (
        <div className="fixed bottom-24 right-6 z-3 w-96 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-xl p-4 flex flex-col gap-4">
            <div className="flex gap-2">
                <input
                    type="number"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                    placeholder="First number"
                    className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/70 backdrop-blur-sm"
                />
                <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/70 backdrop-blur-sm"
                >
                    <option value="+">+</option>
                    <option value="-">−</option>
                    <option value="*">×</option>
                    <option value="/">÷</option>
                </select>
                <input
                    type="number"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                    placeholder="Second number"
                    className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/70 backdrop-blur-sm"
                />
            </div>

            <div className="flex gap-1">
                <button
                    onClick={() => setShowCalculator(false)}
                    className="bg-gray-400 text-white rounded-md px-4 py-2 w-full hover:bg-gray-500 transition"
                >
                    Close
                </button>

                <button
                    onClick={() => {
                        setNum1("");
                        setNum2("");
                        setResult(null);
                    }}
                    className="bg-red-400 text-white rounded-md px-4 py-2 w-full hover:bg-red-500 transition"
                >
                    Reset
                </button>

                <button
                    onClick={calculate}
                    className="bg-blue-500 text-white rounded-md px-4 py-2 w-full hover:bg-blue-600 transition"
                >
                    Calculate
                </button>
            </div>

            {result !== null && (
                <div className="text-center text-md font-semibold text-gray-800">
                    Result: {result}
                </div>
            )}
        </div>
    ) : (
        <button
            onClick={() => setShowCalculator(true)}
            className="fixed bottom-6 right-6 z-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
            title="Open Calculator"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z"
                />
            </svg>
        </button>
    )
  );
}

export default Calculator;