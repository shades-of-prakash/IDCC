import React, { useState } from "react";
import CredentialsHeader from "./CredentialsHeader";
import CredentialsForm from "./CredentialsForm";
import CredentialsTable from "./CredentialsTable"

const Credentials = () => {
  return (
    <div className="select-none w-full h-full flex flex-col">
      <CredentialsHeader />
      <div className="w-full h-[calc(100%-5rem)] p-2 flex gap-2">
        <div className="w-[70%] h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
          <CredentialsTable/>
        </div>
        <div className="w-[30%] h-full">
          <CredentialsForm
          />
        </div>
      </div>
    </div>
  );
};

export default Credentials;
