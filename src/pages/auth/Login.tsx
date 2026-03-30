import { useState } from "react"
import { EyeInvisibleOutlined, EyeOutlined, UserOutlined, LockOutlined, LoadingOutlined } from "@ant-design/icons"
import { toast, Toaster } from "sonner"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../../utils/api"

const Login = () => {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error("Barcha maydonlarni to'ldiring!")
      return
    }

    setLoading(true)

    try {
      const data = await apiFetch("users/login", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      })

      if (data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        const rawRole = (data.role || data.user_role || "USER").toUpperCase().trim();
        const finalRole = rawRole === "EMPLOYEE" ? "USER" : rawRole;
        localStorage.setItem("user_role", finalRole);

        toast.success("Tizimga muvaffaqiyatli kirdingiz!");

        setTimeout(() => {
          if (rawRole === "ADMIN") {
            navigate("/admin/dashboard");
          } else if (rawRole === "MANAGER") {
            navigate("/manager/results");
          } else if (rawRole === "USER" || rawRole === "EMPLOYEE") {

            if (data.is_registered === true) {
              toast.error("Siz allaqachon ro'yxatdan o'tgansiz, tizimga kirish mumkin emas!");
              localStorage.clear();
              setLoading(false); 
              return;
            }

            navigate("/user/welcome");
          }
        }, 800);
      }
    } catch (error: any) {
      console.error("Login Error Details:", error)
      toast.error(error.message || "Login yoki parol xato!")
    } finally {
      setLoading(false) 
    }
  }

  return (
    <>
      <Toaster position="top-center" theme="dark" richColors duration={3000} />

      <section className="flex min-h-screen bg-gray-950 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-sm sm:max-w-md bg-gray-900 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.6)] p-6 sm:p-10 border border-gray-800">

          {/* Header */}
          <h1 className="text-3xl sm:text-4xl text-center font-bold text-white pb-1">
            Kirish
          </h1>
          <p className="text-gray-500 text-sm sm:text-base text-center mb-6 sm:mb-8">
            Ma'lumotlaringizni kiriting
          </p>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="flex flex-col gap-4 sm:gap-6"
          >
            {/* Username */}
            <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 h-11 sm:h-12 focus-within:border-blue-500 transition-colors">
              <UserOutlined className="!text-white text-sm sm:text-base shrink-0" />
              <input
                type="text"
                placeholder="Foydalanuvchi nomi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm min-w-0"
                disabled={loading}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 h-11 sm:h-12 focus-within:border-blue-500 transition-colors">
              <LockOutlined className="!text-white text-sm sm:text-base shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Parolni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm min-w-0"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="text-gray-500 hover:text-blue-400 outline-none transition-colors shrink-0 p-1 -mr-1 touch-manipulation"
                aria-label={showPass ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPass ? (
                  <EyeOutlined className="text-sm sm:text-base" />
                ) : (
                  <EyeInvisibleOutlined className="text-sm sm:text-base" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 sm:mt-2 h-11 sm:h-12 w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm sm:text-base rounded-xl tracking-wide shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 touch-manipulation"
            >
              {loading ? (
                <LoadingOutlined className="text-base sm:text-lg" />
              ) : (
                "Kirish"
              )}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

export default Login