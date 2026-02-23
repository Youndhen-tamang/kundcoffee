const fs = require('fs');

const path = './components/orders/CheckoutModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change size expression
content = content.replace(/size=\{step === "PREPARE" \? "xl" : "lg"\}/, 'size="4xl"');

// 2. Remove the step progress bar
const progressBarStart = `<div className="flex items-center gap-3 mb-12 px-10">`;
if (content.includes(progressBarStart)) {
  const pBarIndex = content.indexOf(progressBarStart);
  // find the closing div of this block. It's followed by `{step === "PREPARE" && renderPrepare()}`
  const pBarEndStr = `</div>\n          )}\n\n          {step === "PREPARE"`;
  const pBarEnd = content.indexOf(pBarEndStr);
  if (pBarEnd !== -1) {
    // We also need to remove `{step !== "SUCCESS" && (`
    const removeStart = content.lastIndexOf(`{step !== "SUCCESS" && (`, pBarIndex);
    if (removeStart !== -1) {
      content = content.substring(0, removeStart) + '\n          {step === "PREPARE"';
    }
  }
}

// 3. Remove step condition rendering and merge them
content = content.replace(/\{step === "PREPARE" && renderPrepare\(\)\}/, '');
content = content.replace(/\{step === "BILL" && renderBill\(\)\}/, '');
content = content.replace(/\{step === "PAYMENT" && renderPayment\(\)\}/, '');

const customRenderStr = `
          {step === "SUCCESS" ? renderSuccess() : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 p-2">
              <div className="flex flex-col gap-8">
                {renderPrepare()}
                <div className="border-t border-zinc-200 pt-8 mt-4">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">Payment</h3>
                  {renderPayment()}
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="sticky top-4">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">Bill Summary</h3>
                  {renderBill()}
                </div>
              </div>
            </div>
          )}
`;
content = content.replace(/\{step === "SUCCESS" && renderSuccess\(\)\}/, customRenderStr);


// Now we need to modify the sub-renders so they fit the layout without duplicate wrappers etc.

// Mute the Proceed to Payment button in renderPrepare since it's all one page now
// In renderPrepare():
// <div className="bg-zinc-900 rounded-2xl p-6 text-white space-y-4 flex flex-col justify-center">
// ...
// <Button onClick={() => setStep("BILL")}
content = content.replace(/<Button\s+onClick=\{\(\) => setStep\("BILL"\)\}[\s\S]*?<\/Button>/, '');

// Mute "Review Bill" button in renderPayment
content = content.replace(/<Button\s+variant="secondary"\s+onClick=\{\(\) => setStep\("BILL"\)\}[\s\S]*?Review Bill\s*<\/Button>/, '');

// Mute "Edit Order" inside renderBill
content = content.replace(/<div className="flex gap-4 w-full max-w-md mt-4">[\s\S]*?<Button\s+variant="secondary"\s+onClick=\{\(\) => setStep\("PREPARE"\)\}[\s\S]*?Edit Order\s*<\/Button>/, '<div className="flex gap-4 w-full max-w-md mt-4">');

// Mute "Proceed to Payment" inside renderBill
content = content.replace(/<Button\s+onClick=\{\(\) => setStep\("PAYMENT"\)\}[\s\S]*?Proceed to Payment\s*<ChevronRight[\s\S]*?<\/Button>/, '');

fs.writeFileSync(path, content, 'utf8');
