// import { useState } from "react";

// const Calculator = () => {
//   const [num1, setNum1] = useState("");
//   const [num2, setNum2] = useState("");
//   const [operation, setOperation] = useState("+");
//   const [result, setResult] = useState(null);
//   const [showCalculator, setShowCalculator] = useState(false);

//   const calculate = () => {
//     const a = parseFloat(num1);
//     const b = parseFloat(num2);

//     if (isNaN(a) || isNaN(b)) {
//       setResult("Please enter valid numbers.");
//       return;
//     }

//     let res;
//     switch (operation) {
//       case "+":
//         res = a + b;
//         break;
//       case "-":
//         res = a - b;
//         break;
//       case "*":
//         res = a * b;
//         break;
//       case "/":
//         res = b !== 0 ? a / b : "Cannot divide by zero";
//         break;
//       default:
//         res = "Invalid operation";
//     }

//     setResult(res);
//   };

//   return (
//     showCalculator ? 
//     (
//         <div className="fixed bottom-24 right-6 z-3 w-96 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-xl p-4 flex flex-col gap-4">
//             <div className="flex gap-2">
//                 <input
//                     type="number"
//                     value={num1}
//                     onChange={(e) => setNum1(e.target.value)}
//                     placeholder="First number"
//                     className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/70 backdrop-blur-sm"
//                 />
//                 <select
//                     value={operation}
//                     onChange={(e) => setOperation(e.target.value)}
//                     className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/70 backdrop-blur-sm"
//                 >
//                     <option value="+">+</option>
//                     <option value="-">−</option>
//                     <option value="*">×</option>
//                     <option value="/">÷</option>
//                 </select>
//                 <input
//                     type="number"
//                     value={num2}
//                     onChange={(e) => setNum2(e.target.value)}
//                     placeholder="Second number"
//                     className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/70 backdrop-blur-sm"
//                 />
//             </div>

//             <div className="flex gap-1">
//                 <button
//                     onClick={() => setShowCalculator(false)}
//                     className="bg-gray-400 text-white rounded-md px-4 py-2 w-full hover:bg-gray-500 transition"
//                 >
//                     Close
//                 </button>

//                 <button
//                     onClick={() => {
//                         setNum1("");
//                         setNum2("");
//                         setResult(null);
//                     }}
//                     className="bg-red-400 text-white rounded-md px-4 py-2 w-full hover:bg-red-500 transition"
//                 >
//                     Reset
//                 </button>

//                 <button
//                     onClick={calculate}
//                     className="bg-blue-500 text-white rounded-md px-4 py-2 w-full hover:bg-blue-600 transition"
//                 >
//                     Calculate
//                 </button>
//             </div>

//             {result !== null && (
//                 <div className="text-center text-md font-semibold text-gray-800">
//                     Result: {result}
//                 </div>
//             )}
//         </div>
//     ) : (
//         <button
//             onClick={() => setShowCalculator(true)}
//             className="fixed bottom-6 right-6 z-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
//             title="Open Calculator"
//         >
//             <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={1.5}
//                 stroke="currentColor"
//                 className="size-8"
//             >
//                 <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z"
//                 />
//             </svg>
//         </button>
//     )
//   );
// }

// export default Calculator;

"use client"

import { useState, useEffect } from "react"
import { CalculatorIcon, X } from "lucide-react"

const Calculator = () => {
  const [display, setDisplay] = useState("0")
  const [currentValue, setCurrentValue] = useState("")
  const [storedValue, setStoredValue] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showCalculator) return

      e.preventDefault()

      // Numbers
      if (/^[0-9]$/.test(e.key)) {
        inputDigit(Number.parseInt(e.key, 10))
      }
      // Decimal point
      else if (e.key === ".") {
        inputDot()
      }
      // Operators
      else if (["+", "-", "*", "/"].includes(e.key)) {
        performOperation(e.key)
      }
      // Equal sign or Enter
      else if (e.key === "=" || e.key === "Enter") {
        performCalculation()
      }
      // Backspace
      else if (e.key === "Backspace") {
        clearLastChar()
      }
      // Escape or Delete
      else if (e.key === "Escape" || e.key === "Delete") {
        clearAll()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showCalculator, currentValue, storedValue, operator, waitingForOperand])

  const clearAll = () => {
    setDisplay("0")
    setCurrentValue("")
    setStoredValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }

  const clearLastChar = () => {
    if (currentValue.length > 1) {
      const newValue = currentValue.slice(0, -1)
      setCurrentValue(newValue)
      setDisplay(newValue)
    } else {
      setCurrentValue("")
      setDisplay("0")
    }
  }

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setCurrentValue(String(digit))
      setDisplay(String(digit))
      setWaitingForOperand(false)
    } else {
      const newValue = currentValue === "0" ? String(digit) : currentValue + digit
      setCurrentValue(newValue)
      setDisplay(newValue)
    }
  }

  const inputDot = () => {
    if (waitingForOperand) {
      setCurrentValue("0.")
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (currentValue.indexOf(".") === -1) {
      setCurrentValue(currentValue + ".")
      setDisplay(currentValue + ".")
    }
  }

  const performOperation = (nextOperator) => {
    const inputValue = Number.parseFloat(currentValue)

    if (storedValue === null) {
      setStoredValue(inputValue)
    } else if (operator) {
      const result = calculate(storedValue, inputValue, operator)
      setDisplay(String(result))
      setStoredValue(result)
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }

  const performCalculation = () => {
    if (operator && currentValue && storedValue !== null) {
      const inputValue = Number.parseFloat(currentValue)
      const result = calculate(storedValue, inputValue, operator)

      setDisplay(String(result))
      setCurrentValue(String(result))
      setStoredValue(null)
      setOperator(null)
      setWaitingForOperand(true)
    }
  }

  const calculate = (firstOperand, secondOperand, operation) => {
    switch (operation) {
      case "+":
        return firstOperand + secondOperand
      case "-":
        return firstOperand - secondOperand
      case "*":
        return firstOperand * secondOperand
      case "/":
        return secondOperand !== 0 ? firstOperand / secondOperand : "Error"
      default:
        return secondOperand
    }
  }

  const getDisplayOperation = (op) => {
    switch (op) {
      case "+":
        return "+"
      case "-":
        return "−"
      case "*":
        return "×"
      case "/":
        return "÷"
      default:
        return ""
    }
  }

  return (
    <>
      {showCalculator ? (
        <div className="fixed bottom-24 right-6 z-10 w-80 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Calculator display */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-500 font-medium">Calculator</h3>
              <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="text-right">
              {storedValue !== null && (
                <div className="text-gray-500 text-sm">
                  {storedValue} {getDisplayOperation(operator)}
                </div>
              )}
              <div className="text-2xl font-semibold truncate">{display}</div>
            </div>
          </div>

          {/* Calculator keypad */}
          <div className="grid grid-cols-4 gap-1 p-2">
            {/* First row */}
            <button onClick={clearAll} className="calc-btn bg-red-100 hover:bg-red-200 text-red-600">
              C
            </button>
            <button onClick={clearLastChar} className="calc-btn bg-gray-100 hover:bg-gray-200">
              ←
            </button>
            <button onClick={() => performOperation("/")} className="calc-btn bg-gray-100 hover:bg-gray-200">
              ÷
            </button>
            <button onClick={() => performOperation("*")} className="calc-btn bg-gray-100 hover:bg-gray-200">
              ×
            </button>

            {/* Second row */}
            <button onClick={() => inputDigit(7)} className="calc-btn hover:bg-gray-100">
              7
            </button>
            <button onClick={() => inputDigit(8)} className="calc-btn hover:bg-gray-100">
              8
            </button>
            <button onClick={() => inputDigit(9)} className="calc-btn hover:bg-gray-100">
              9
            </button>
            <button onClick={() => performOperation("-")} className="calc-btn bg-gray-100 hover:bg-gray-200">
              −
            </button>

            {/* Third row */}
            <button onClick={() => inputDigit(4)} className="calc-btn hover:bg-gray-100">
              4
            </button>
            <button onClick={() => inputDigit(5)} className="calc-btn hover:bg-gray-100">
              5
            </button>
            <button onClick={() => inputDigit(6)} className="calc-btn hover:bg-gray-100">
              6
            </button>
            <button onClick={() => performOperation("+")} className="calc-btn bg-gray-100 hover:bg-gray-200">
              +
            </button>

            {/* Fourth row */}
            <button onClick={() => inputDigit(1)} className="calc-btn hover:bg-gray-100">
              1
            </button>
            <button onClick={() => inputDigit(2)} className="calc-btn hover:bg-gray-100">
              2
            </button>
            <button onClick={() => inputDigit(3)} className="calc-btn hover:bg-gray-100">
              3
            </button>
            <button
              onClick={performCalculation}
              className="calc-btn bg-blue-500 hover:bg-blue-600 text-white row-span-2"
            >
              =
            </button>

            {/* Fifth row */}
            <button onClick={() => inputDigit(0)} className="calc-btn col-span-2 hover:bg-gray-100">
              0
            </button>
            <button onClick={inputDot} className="calc-btn hover:bg-gray-100">
              .
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCalculator(true)}
          className="fixed bottom-6 right-6 z-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
          title="Open Calculator"
        >
          <CalculatorIcon size={24} />
        </button>
      )}

      <style jsx="true">{`
        .calc-btn {
          @apply flex items-center justify-center h-12 rounded-lg bg-white hover:bg-gray-100 transition-colors duration-150 font-medium;
        }
      `}</style>
    </>
  )
}

export default Calculator

