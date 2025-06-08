import React from 'react';

export default function Privacy() {
  return (
    <div className="container max-w-3xl py-8 space-y-4">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p>
        We only process your files to convert them to Excel. Files are encrypted
        in transit and removed from our servers automatically after 24 hours.
      </p>
      <p>
        By using this service you agree that your data may be temporarily
        processed for the sole purpose of performing the conversion.
      </p>
    </div>
  );
}
