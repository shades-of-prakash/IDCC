import React, { useState } from "react";
import { useNavigate } from "react-router";
import UserLoginImage from "../assets/images/userloginimage.png";
import CustomSelect from "../components/CustomSelect";
import { useContests } from "../contexts/ContestContext";
import { useUser } from "../contexts/UserContext";
import { Plus, Trash } from "lucide-react";

const UserLogin = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    contestId: null,
    participants: [
      { name: "", regNo: "" },
      { name: "", regNo: "" },
    ],
    email: "",
    college: "",
    dept: "",
    phone: "",
    username: "",
    password: "",
  });

  const { login, loginLoading } = useUser();
  const navigate = useNavigate();

  const {
    data: contests = [],
    isLoading,
    isError,
    setSelectedContest,
  } = useContests();

  const [errors, setErrors] = useState({});

  // --- Contest selection
  const handleContestChange = (option) => {
    setFormData((prev) => ({ ...prev, contestId: option }));
    setSelectedContest(option);
    setErrors((prev) => ({ ...prev, contestId: "" }));
  };

  // --- Generic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  // --- Participant input change
  const handleParticipantChange = (index, field, value) => {
    const updated = [...formData.participants];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, participants: updated }));
    setErrors((prev) => ({ ...prev, [`participant${index}${field}`]: "" }));
  };

  // --- Add/Remove participants
  const addParticipant = () => {
    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, { name: "", regNo: "" }],
    }));
  };

  const removeParticipant = () => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.slice(0, -1),
    }));
  };

  // --- Step 1 validation
  const handleStep1Submit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.contestId) newErrors.contestId = "Please select a contest";

    formData.participants.forEach((p, i) => {
      if (!p.name) newErrors[`participant${i}name`] = "Name is required";
      if (!p.regNo) newErrors[`participant${i}regNo`] = "Reg No is required";
    });

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.college) newErrors.college = "College is required";
    if (!formData.dept) newErrors.dept = "Dept is required";
    if (!formData.phone) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setStep(2);
  };

  // --- Step 2 submit (login)
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await login({
        username: formData.username,
        password: formData.password,
        contestId: formData.contestId.value,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        dept: formData.dept,
        participants: formData.participants,
      });

      navigate("/user/instructions");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid username or password";
      setErrors((prev) => ({ ...prev, form: message }));
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
      <div className="w-full md:w-[70%] lg:w-[55%] xl:w-1/2 h-dvh flex items-center justify-center p-6 xl:p-10">
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

          {/* Step 1 */}
          {step === 1 && (
            <form
              onSubmit={handleStep1Submit}
              className="flex flex-col gap-3.5 xl:gap-5"
            >
              {/* Contest Select */}
              <div className="flex flex-col gap-1">
                <label className="text-sm xl:text-base font-medium text-gray-700">
                  Select Contest
                </label>
                <CustomSelect
                  options={contests.map((c) => ({
                    label: c.name,
                    value: c._id,
                  }))}
                  value={formData.contestId}
                  onChange={handleContestChange}
                  placeholder="Select a contest"
                  disabled={isLoading || isError}
                  loading={isLoading}
                />
                {errors.contestId && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.contestId}
                  </span>
                )}
                {isError && (
                  <span className="text-red-500 text-xs mt-1">
                    Failed to load contests
                  </span>
                )}
              </div>

              {/* Participants */}
              {formData.participants.map((p, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-base font-medium text-black">
                    Participant {i + 1}
                  </span>
                  <div className="flex sm:flex-row gap-2.5">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={p.name}
                        onChange={(e) =>
                          handleParticipantChange(i, "name", e.target.value)
                        }
                        className={`w-[230px] flex-1 px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                          errors[`participant${i}name`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <div className="flex flex-1 gap-1.5">
                        <input
                          type="text"
                          placeholder="Reg. No"
                          value={p.regNo}
                          onChange={(e) =>
                            handleParticipantChange(i, "regNo", e.target.value)
                          }
                          className={`flex-1 px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                            errors[`participant${i}regNo`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {formData.participants.length > 1 && i !== 0 && (
                          <div
                            onClick={removeParticipant}
                            className="hover:bg-red-50 w-10 flex items-center justify-center border border-gray-300 rounded cursor-pointer"
                          >
                            <Trash size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {(errors[`participant${i}name`] ||
                    errors[`participant${i}regNo`]) && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors[`participant${i}name`] ||
                        errors[`participant${i}regNo`]}
                    </span>
                  )}
                </div>
              ))}

              {/* Add Participant */}
              {formData.participants.length < 2 && (
                <div
                  onClick={addParticipant}
                  className="flex items-center justify-center rounded h-12 border border-gray-400/50 cursor-pointer hover:bg-gray-50 transition"
                >
                  <Plus size={16} className="mr-2" />
                  Add Participant
                </div>
              )}

              {/* Email, College, Dept, Phone */}
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
              {errors.email && (
                <span className="text-red-500 text-xs">{errors.email}</span>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1">
                  <input
                    type="text"
                    name="college"
                    placeholder="College"
                    value={formData.college}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                      errors.college ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.college && (
                    <span className="text-red-500 text-xs">
                      {errors.college}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="dept"
                    placeholder="Dept"
                    value={formData.dept}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                      errors.dept ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dept && (
                    <span className="text-red-500 text-xs">{errors.dept}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
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
                {errors.phone && (
                  <span className="text-red-500 text-xs">{errors.phone}</span>
                )}
              </div>

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

              {errors.form && (
                <div className="text-center text-red-500 text-sm font-medium">
                  {errors.form}
                </div>
              )}

              <div className="flex flex-col">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                    errors.username || errors.form
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.username && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.username}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`px-3 py-2.5 text-sm md:text-[15px] border rounded-md ${
                    errors.password || errors.form
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.password && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.password}
                  </span>
                )}
              </div>

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
                  disabled={loginLoading}
                  className={`w-1/2  py-2.5 text-sm md:text-base text-white rounded-md flex items-center justify-center gap-2 ${
                    loginLoading
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-black hover:bg-gray-900"
                  } transition-all`}
                >
                  {loginLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{loginLoading ? "Submitting" : "Submit"}</span>
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
