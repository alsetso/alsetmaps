'use client';

// Temporarily commented out due to type mismatches with BuyerIntentData structure
// TODO: Fix component to match actual BuyerIntentData type definition

export function BuyerIntentDirectory({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Buyer Intent Directory
        </h2>
        <p className="text-gray-600">
          This component is temporarily disabled due to type mismatches.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please check the BuyerIntentData type definition and update the component accordingly.
        </p>
      </div>
    </div>
  );
}
