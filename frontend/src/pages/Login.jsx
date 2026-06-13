import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Refrigerator } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/useAuth"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth()
    const navigate = useNavigate();


    async function handleSubmit(event) {
        event.preventDefault();
        await login({ email, password })
        navigate("/")
    }

    return (
        <div className="flex flex-col mx-auto w-full max-w-sm min-h-dvh gap-6 p-6 items-center justify-center">

            {/* Logo */}
            <Link to="/" className="flex justify-center w-full">
                <Refrigerator className="w-1/3 h-auto cursor-pointer" />
            </Link>

            {/* Form */}
            <form className="w-full flex flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label className="text-gray-700" htmlFor="email">
                            Email<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="placeholder:text-gray-400 w-full"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-gray-700" htmlFor="password">
                            Password<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button type="submit" className="text-md font-bold bg-blue-500 hover:bg-blue-600 w-full px-10 py-5 hover:cursor-pointer" onClick={handleSubmit}>
                        Log In
                    </Button>
                </div>
                <Link to="/signup" className="text-sm">
                    Don't have an account?{' '}
                    <span
                        className="font-bold hover:cursor-pointer text-blue-500 hover:text-blue-600"
                    >
                        Sign Up
                    </span>
                </Link>
            </form>
        </div>
    )
}

export default Login
