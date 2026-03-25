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
    // Oddiy validatsiya
    if (!username.trim() || !password.trim()) {
      toast.error("Barcha maydonlarni to'ldiring!");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("users/login", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      if (data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        const userRole = data.role || "ADMIN";
        localStorage.setItem("user_role", userRole);

        toast.success("Tizimga muvaffaqiyatli kirdingiz!");

        setTimeout(() => {
          if (userRole === "ADMIN") {
            navigate("/admin/dashboard");
          } else if (userRole === "MANAGER") {
            navigate("/manager/results");
          } else {
            navigate("/user/welcome");
          }
        }, 800);
      }
    } catch (error: any) {
      console.error("Login Error Details:", error);
      toast.error(error.message || "Login yoki parol xato!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" theme="dark" richColors duration={3000} />

      <section className="flex min-h-screen bg-gray-950 items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.6)] p-10 border border-gray-800">
          <h1 className="text-4xl text-center font-bold text-white pb-1">Kirish</h1>
          <p className="text-gray-500 text-center mb-8">Ma'lumotlaringizni kiriting</p>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            className="flex flex-col gap-6"
          >
            {/* Username */}
            <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 h-12 focus-within:border-blue-500 transition-colors">
              <UserOutlined className="!text-white text-base" />
              <input
                type="text"
                placeholder="Foydalanuvchi nomi"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 h-12 focus-within:border-blue-500 transition-colors">
              <LockOutlined className="!text-white text-base" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Parolni kiriting"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="text-gray-500 hover:text-blue-400 outline-none transition-colors"
              >
                {showPass ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base rounded-xl tracking-wide shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <LoadingOutlined className="text-lg" /> : "Kirish"}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

export default Login