"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";

const VerificationPage = () => {
  // Router to route to new page
  const router = useRouter();

  // To extract query params from the URL
  const params = useSearchParams();
  const errCode = params.get("errCode") || "404";
  const errMessage = params.get("errMessage") || "Page not found";
  const redirectUrl = params.get("url") || "/";

  // Decoding the error message
  const decodedErrMessage = decodeURIComponent(errMessage);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center place-items-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Auth Error: {errCode}
          </h1>
          <Label className="text-2xl font-normal">{decodedErrMessage}</Label>
          <Button
            className="block m-10"
            onClick={() => {
              router.replace(redirectUrl);
            }}
          >
            Redirect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
