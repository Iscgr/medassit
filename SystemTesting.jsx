import React from "react";
import SystemValidator from "@/components/testing/SystemValidator";

export default function SystemTesting() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
            <SystemValidator />
        </div>
    );
}