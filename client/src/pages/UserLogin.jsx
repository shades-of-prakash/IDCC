import React, { useState } from "react";
import { useNavigate } from "react-router";
import UserLoginImage from "../assets/images/userloginimage.png";
import CustomSelect from "../components/CustomSelect";
import { useContests } from "../contexts/ContestContext";
import { useUser } from "../contexts/UserContext";

const UserLogin = () => {
  const [step, setStep] = useState(1);
  const { login, setSession } = useUser();

  const navigate = useNavigate();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const newErrors = {};

    if (!formData.selectedContest)
      newErrors.selectedContest = "Please select a contest";
    if (!formData.participant1Name)
      newErrors.participant1Name = "Participant 1 name is required";
    if (!formData.participant1Reg)
      newErrors.participant1Reg = "Participant 1 reg no is required";

    if (formData.teamSize > 1) {
      if (!formData.participant2Name)
        newErrors.participant2Name = "Participant 2 name is required";
      if (!formData.participant2Reg)
        newErrors.participant2Reg = "Participant 2 reg no is required";
    }

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.college) newErrors.college = "College is required";
    if (!formData.dept) newErrors.dept = "Dept is required";
    if (!formData.phone) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

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

      if (!sessionData?.sessionId) {
        setLoginError("Failed to retrieve session ID");
        setIsSubmitting(false);
        return;
      }

      // Save session before navigating
      setSession(sessionData);
      localStorage.setItem("session", JSON.stringify(sessionData));

      // Navigate after slight delay
      setTimeout(() => {
        navigate(`/user/${sessionData.sessionId}/playground`);
      }, 100);
    } catch (err) {
      console.error(err);

      // Capture server-side validation errors
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError("Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-dvh flex select-none">
      {/* Left Image */}
      <div className="w-1/2 h-dvh border-r border-neutral-600/30">
        <img
          src={UserLoginImage}
          alt="login-image"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Form */}

      <div className="w-full md:w-[70%] lg:w-[55%] xl:w-1/2  h-dvh flex items-center justify-center p-6 xl:p-10">
        <div className="flex flex-col w-full max-w-lg xl:max-w-xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 xl:gap-4 mb-4 xl:mb-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl xl:text-5xl font-semibold leading-none">
                Logiq
              </span>
              <span className="text-[11px] font-bold tracking-wider">
                BY IDCC
              </span>
            </div>
            {step !== 2 && (
              <span className="text-sm xl:text-base text-center text-gray-700">
                where algorithms meet adrenaline.
              </span>
            )}
          </div>

          {/* Step 1 Form */}
          {step === 1 && (
            <form
              onSubmit={handleStep1Submit}
              className="flex flex-col gap-3.5 xl:gap-5"
            >
              {/* Contest select */}
              <div className="flex flex-col gap-1">
                <label className="text-sm xl:text-base font-medium text-gray-700">
                  Select Contest
                </label>
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
              <div className="flex flex-col gap-1">
                <span className="text-base font-medium text-black">
                  Participant 1
                </span>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    name="participant1Name"
                    placeholder="Name"
                    value={formData.participant1Name}
                    onChange={handleChange}
                    className={`flex-1 px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
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
                    className={`flex-1 px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                      errors.participant1Reg
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* Participant 2 (if any) */}
              {formData.teamSize > 1 && (
                <div className="flex flex-col gap-1">
                  <span className="text-base font-medium text-black">
                    Participant 2
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      name="participant2Name"
                      placeholder="Name"
                      value={formData.participant2Name}
                      onChange={handleChange}
                      className={`flex-1 px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
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
                      className={`flex-1 px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                        errors.participant2Reg
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />

              {/* College & Dept */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  name="college"
                  placeholder="College"
                  value={formData.college}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                    errors.college ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <input
                  type="text"
                  name="dept"
                  placeholder="Dept"
                  value={formData.dept}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                    errors.dept ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>

              {/* Phone */}
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className={`px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />

              {/* Continue */}
              <button
                type="submit"
                className="bg-black py-2.5 text-sm md:text-base text-white rounded-md mt-2 hover:bg-gray-900 transition-all"
              >
                Continue
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="flex flex-col gap-4">
              <span className="text-sm md:text-base text-center text-gray-600">
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
                className={`px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />

              {/* Buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/2 bg-neutral-200/60 border border-gray-300 py-2.5 text-sm md:text-base text-black rounded-md"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-1/2 py-2.5 text-sm md:text-base text-white rounded-md flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-black hover:bg-gray-900"
                  } transition-all`}
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{isSubmitting ? "Submitting" : "Submit"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
