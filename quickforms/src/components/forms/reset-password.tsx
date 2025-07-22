"use client";

import React, { useState, useEffect } from "react";
import { AuthLayout } from "./AuthLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), ""], "Passwords must match")
    .required("Confirm Password is required"),
});

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const code = searchParams?.get("oobCode");
    if (!code) {
      setApiError("Invalid or missing password reset code.");
      setIsVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, code)
      .then(() => {
        setOobCode(code);
        setIsVerifying(false);
      })
      .catch(() => {
        setApiError(
          "The password reset link is invalid or has expired. Please request a new one."
        );
        setIsVerifying(false);
      });
  }, [searchParams]);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (isVerifying) {
    return (
      <AuthLayout>
        <p className="text-center text-gray-600">Verifying reset link…</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Reset Your Password
      </h2>
      <p className="text-gray-600 mb-6">
        Please enter your new password below.
      </p>

      {apiError && (
        <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
          {apiError}
        </p>
      )}
      {apiSuccess && (
        <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">
          {apiSuccess}
        </p>
      )}

      {!apiError && oobCode && (
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={ResetPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setApiError("");
            setApiSuccess("");

            try {
              await confirmPasswordReset(auth, oobCode, values.password);
              setApiSuccess(
                "✅ Your password has been reset! Redirecting to login…"
              );
              setTimeout(() => {
                navigateTo("/login");
              }, 3000);
            } catch (err: any) {
              setApiError(
                err?.message || "Failed to reset password. Please try again."
              );
            }

            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-2"
                >
                  New Password
                </label>
                <Field
                  type="password"
                  name="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Confirm New Password
                </label>
                <Field
                  type="password"
                  name="confirmPassword"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-300 mt-6"
              >
                {isSubmitting ? "Resetting…" : "Reset Password"}
              </button>
            </Form>
          )}
        </Formik>
      )}

      <p className="text-center text-gray-600 mt-6">
        <button
          onClick={() => navigateTo("/login")}
          className="text-indigo-600 cursor-pointer hover:underline font-medium"
        >
          Back to Log In
        </button>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
