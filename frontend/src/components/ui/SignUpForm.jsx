// Name: Paula Tica
// Date: 05/15/2026
// This is the registration form that pops up on the Log In page

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/useAuth"
import { useNavigate } from "react-router-dom"

function SignUpForm() {
    // Track input of each password field
    
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const { register, login } = useAuth();
    const navigate = useNavigate();

    // Check if both password fields have been entered and don't match
    const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

    // Check password length
    const passwordTooShort = password.length > 0 && password.length < 8

    // If passwords don't match, stop form submission
    const handleSubmit = async (event) => {
        event.preventDefault()
        if (passwordMismatch || passwordTooShort) {
            return
        }
        try {
            console
            await register({name: name || null, email, password });
            await login({ email, password });
            navigate("/");
        } catch (err) {
            console.error(err)
            alert(err.message)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label className="text-gray-700" htmlFor="signup-name">Name</Label>
                    <Input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label className="text-gray-700" htmlFor="signup-email">
                        Email<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="signup-email"
                        type="email"
                        placeholder="example@email.com"
                        className="placeholder:text-gray-400"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label className="text-gray-700" htmlFor="signup-password">
                        Password<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={8}
                        required
                    />
                    {passwordTooShort && (
                        <p className="text-xs text-red-500">Password must be at least 8 characters</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label className="text-gray-700" htmlFor="confirm-password">
                        Confirm Password<span className="text-red-500">*</span>
                        </Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                    />
                    {/* Show error message as soon as there is a mismatch */}
                    {passwordMismatch && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                </div>
                <div className="flex justify-center">
                <Button type="submit" className="text-md font-bold flex-col gap-2 bg-blue-100 rounded-full px-6 py-5" disabled={passwordMismatch || passwordTooShort}>Create Account</Button>
                </div>
            </div>
        </form>
    )
}

export default SignUpForm
