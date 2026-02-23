const fs = require('fs');

const path = './components/tables/CheckoutModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update standard Modal properties
content = content.replace(
  'title={`Checkout - Table ${table.name}`}',
  'title={`Checkout - Table ${table.name}`}\n      size="4xl"'
);

// Remove 'step' state and handlePrint step modification
content = content.replace(/const \[step, setStep\] = useState<1 \| 2 \| 3>\(1\);.*\n/, '');
content = content.replace(/setStep\(3\);\n/, '');

// We want to extract the Step 1, Step 2, Step 3 contents
// Step 1:
const step1Start = content.indexOf('{/* Step 1: Customer Selection */}');
const step1End = content.indexOf('{/* Step 2: Bill Summary & Print */}');
let step1Content = content.substring(step1Start, step1End);
step1Content = step1Content.replace(/\{step === 1 && \(\s*<div.*?className="space-y-6.*?>/, '');
step1Content = step1Content.replace(/<Button\s+onClick=\{\(\) => setStep\(2\)\}[\s\S]*?<\/span>\s*<\/Button>\n\s*<\/div>\n\s*\)\}\n*/, '');

// Step 2:
const step2Start = step1End;
const step2End = content.indexOf('{/* Step 3: Payment Selection */}');
let step2Content = content.substring(step2Start, step2End);
step2Content = step2Content.replace(/\{step === 2 && checkoutData && \(\s*<div.*?className="space-y-6.*?>/, '{checkoutData && (\n          <div className="space-y-6">');
// Change "Print & Proceed" button to just "Print Bill"
step2Content = step2Content.replace('Print & Proceed', 'Print Bill');
step2Content = step2Content.replace(/<\/div>\n\s*\)\}\n*/, '</div>\n        )}\n');

// Step 3:
const step3Start = step2End;
const step3End = content.indexOf('</div>\n\n      <Modal\n        isOpen={isSelectingFreeItems}');
let step3Content = content.substring(step3Start, step3End);
step3Content = step3Content.replace(/\{step === 3 && \(\s*<div.*?className="space-y-6.*?>/, '<div className="space-y-6">');
step3Content = step3Content.replace(/<\/div>\n\s*\)\}\n*/, '</div>\n');

// Now, let's assemble the new layout
const preGridStart = content.indexOf('<div className="flex flex-col gap-6 p-2">');
const preGridContent = content.substring(0, preGridStart);
const postGridContent = content.substring(step3End);

const newLayout = `
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-8 p-4">
        {/* Left Column: Customer & Payment */}
        <div className="flex flex-col gap-8">
          <div className="space-y-6">
            ${step1Content.trim()}
          </div>
          <div className="space-y-6">
            ${step3Content.trim()}
          </div>
        </div>

        {/* Right Column: Bill Summary */}
        <div className="flex flex-col gap-8 bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100">
          ${step2Content.trim()}
        </div>
      </div>
`;

const finalContent = preGridContent + newLayout + postGridContent;
fs.writeFileSync(path, finalContent, 'utf8');
