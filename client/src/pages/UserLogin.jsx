import React, { useState } from "react";
import UserLoginImage from "../assets/images/userloginimage.png";
import CustomSelect from "../components/CustomSelect";
import { useContests } from "../contexts/ContestContext";
import { useUser } from "../contexts/UserContext";

const UserLogin = () => {
  const [step, setStep] = useState(1);
  const { login } = useUser();

  const [formData, setFormData] = useState({
    selectedContest: null,
    teamSize: 1,
    participant1Name: "",
    participant1Reg: "",
    participant2Name: "",
    participant2Reg: "",
    email: "",
    college: "",
    dept: "",
    phone: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const { data: contests = [], isLoading, isError } = useContests();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleContestChange = (option) => {
    const contest = contests.find((c) => c._id === option.value);
    const teamSizeValue =
      contest?.teamSize === "individual"
        ? 1
        : contest?.teamSize === "team"
        ? 2
        : Number(contest?.teamSize) || 1;

    setFormData((prev) => ({
      ...prev,
      selectedContest: option,
      teamSize: teamSizeValue,
    }));
    setErrors((prev) => ({ ...prev, selectedContest: "" }));
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    let hasError = false;
    const newErrors = {};

    if (!formData.selectedContest) {
      newErrors.selectedContest = "Please select a contest";
      hasError = true;
    }
    if (!formData.participant1Name) {
      newErrors.participant1Name = "Participant 1 name is required";
      hasError = true;
    }
    if (!formData.participant1Reg) {
      newErrors.participant1Reg = "Participant 1 reg no is required";
      hasError = true;
    }

    if (formData.teamSize > 1) {
      if (!formData.participant2Name) {
        newErrors.participant2Name = "Participant 2 name is required";
        hasError = true;
      }
      if (!formData.participant2Reg) {
        newErrors.participant2Reg = "Participant 2 reg no is required";
        hasError = true;
      }
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      hasError = true;
    }
    if (!formData.college) {
      newErrors.college = "College is required";
      hasError = true;
    }
    if (!formData.dept) {
      newErrors.dept = "Dept is required";
      hasError = true;
    }
    if (!formData.phone) {
      newErrors.phone = "Phone is required";
      hasError = true;
    }

    setErrors(newErrors);
    if (!hasError) setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoginError("");
    let hasError = false;
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
      hasError = true;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    try {
      const participants = [
        { name: formData.participant1Name, regNo: formData.participant1Reg },
      ];

      if (formData.teamSize > 1) {
        participants.push({
          name: formData.participant2Name,
          regNo: formData.participant2Reg,
        });
      }

      const sessionData = await login({
        username: formData.username,
        password: formData.password,
        selectedContest: formData.selectedContest.value,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        dept: formData.dept,
        participants,
      });

      const sessionId = sessionData?.data.sessionId;
      if (!sessionId) {
        setLoginError("Failed to retrieve session ID");
        return;
      }
      window.location.href = `/user/${sessionId}/playground`;
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="w-screen h-dvh flex">
      {/* Left Image */}
      <div className="w-1/2 h-dvh border-r border-neutral-600/30">
        <img
          src={UserLoginImage}
          alt="login-image"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Form */}
      <div className="w-1/2 bg-white h-dvh flex flex-col justify-center px-24">
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl font-semibold leading-none">Logiq</span>
            <span className="text-[10px] font-bold">BY IDCC</span>
          </div>
          {step !== 2 && (
            <span className="text-sm">where algorithms meet adrenaline.</span>
          )}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="flex flex-col gap-5">
            {/* Contest */}
            <div className="flex flex-col text-sm gap-1">
              <label className="font-medium text-gray-700">Select Contest</label>
              <CustomSelect
                options={contests.map((c) => ({
                  label: c.name,
                  value: c._id,
                }))}
                value={formData.selectedContest}
                onChange={handleContestChange}
                placeholder="Select a contest"
                disabled={isLoading || isError}
                loading={isLoading}
              />
              {errors.selectedContest && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.selectedContest}
                </span>
              )}
              {isError && (
                <span className="text-red-500 text-xs mt-1">
                  Failed to load contests
                </span>
              )}
            </div>

            {/* Participant 1 */}
            <div className="flex flex-col text-xs gap-1">
              <span className="text-sm text-black font-medium">Participant 1</span>
              <div className="flex gap-2 text-sm">
                <input
                  type="text"
                  name="participant1Name"
                  placeholder="Name"
                  value={formData.participant1Name}
                  onChange={handleChange}
                  className={`px-4 py-2 text-base border rounded-md flex-1 ${
                    errors.participant1Name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <input
                  type="text"
                  name="participant1Reg"
                  placeholder="Reg.no"
                  value={formData.participant1Reg}
                  onChange={handleChange}
                  className={`px-4 py-2 text-base border rounded-md flex-1 ${
                    errors.participant1Reg ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.participant1Name && (
                <span className="text-red-500 text-xs">
                  {errors.participant1Name}
                </span>
              )}
              {errors.participant1Reg && (
                <span className="text-red-500 text-xs">
                  {errors.participant1Reg}
                </span>
              )}
            </div>

            {/* Participant 2 (only if teamSize > 1) */}
            {formData.teamSize > 1 && (
              <div className="flex flex-col text-xs gap-1">
                <span className="text-sm text-black font-medium">
                  Participant 2
                </span>
                <div className="flex gap-2 text-sm">
                  <input
                    type="text"
                    name="participant2Name"
                    placeholder="Name"
                    value={formData.participant2Name}
                    onChange={handleChange}
                    className={`px-4 py-2 text-base border rounded-md flex-1 ${
                      errors.participant2Name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <input
                    type="text"
                    name="participant2Reg"
                    placeholder="Reg.no"
                    value={formData.participant2Reg}
                    onChange={handleChange}
                    className={`px-4 py-2 text-base border rounded-md flex-1 ${
                      errors.participant2Reg
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.participant2Name && (
                  <span className="text-red-500 text-xs">
                    {errors.participant2Name}
                  </span>
                )}
                {errors.participant2Reg && (
                  <span className="text-red-500 text-xs">
                    {errors.participant2Reg}
                  </span>
                )}
              </div>
            )}

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`px-4 py-2 text-base border rounded-md ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <span className="text-red-500 text-xs">{errors.email}</span>
            )}

            {/* College & Dept */}
            <div className="flex gap-2 text-sm">
              <input
                type="text"
                name="college"
                placeholder="College"
                value={formData.college}
                onChange={handleChange}
                className={`px-4 py-2 text-base border rounded-md flex-1 ${
                  errors.college ? "border-red-500" : "border-gray-300"
                }`}
              />
              <input
                type="text"
                name="dept"
                placeholder="Dept"
                value={formData.dept}
                onChange={handleChange}
                className={`px-4 py-2 text-base border rounded-md flex-1 ${
                  errors.dept ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors.college && (
              <span className="text-red-500 text-xs">{errors.college}</span>
            )}
            {errors.dept && (
              <span className="text-red-500 text-xs">{errors.dept}</span>
            )}

            {/* Phone */}
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className={`px-4 py-2 text-base border rounded-md ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phone && (
              <span className="text-red-500 text-xs">{errors.phone}</span>
            )}

            <button
              type="submit"
              className="bg-black px-2 py-3 text-base text-white rounded-md mt-2"
            >
              Continue
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="flex flex-col gap-4">
            <span className="text-sm m-2 text-center text-gray-600">
              Enter credentials provided by your coordinator.
            </span>

            {loginError && (
              <span className="text-red-500 text-xs text-center">
                {loginError}
              </span>
            )}

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={`px-4 py-2 text-base border rounded-md ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.username && (
              <span className="text-red-500 text-xs">{errors.username}</span>
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`px-4 py-2 text-base border rounded-md ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <span className="text-red-500 text-xs">{errors.password}</span>
            )}

            <div className="w-full flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 bg-neutral-200/60 border border-grey-400 px-2 py-3 text-black rounded-md"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 bg-black px-2 py-3 text-white rounded-md"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
