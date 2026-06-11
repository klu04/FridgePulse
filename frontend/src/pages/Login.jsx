import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SignUpForm from "@/components/ui/SignUpForm"
import { useAuth } from "@/lib/useAuth"
import { useNavigate } from "react-router-dom"

function Login() {
    // Controls whether the sign up dialog is open or closed
    const [signUp, setSignUp] = useState(false)

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
        <div className="p-6 flex flex-col min-h-screen">
            <h1 className="text-center text-2xl md:text-4xl font-semibold text-gray-900 pl-8 md:pl-0">Smart Grocery Housekeeping</h1>
            <div className="flex flex-1 items-center justify-center">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-base text-xl">Login to your account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form>
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
                                        className="placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2 mb-6">
                                    <Label className="text-gray-700" htmlFor="password">
                                        Password<span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <p className="text-base md:text-sm mb-6">
                                Don't have an account?{' '}
                                <span
                                    onClick={() => setSignUp(true)}
                                    className="text-base md:text-sm font-bold cursor-pointer text-blue-800 hover:text-blue-800"
                                >
                                    Sign Up
                                </span>
                            </p>
                            <div className="flex justify-center">
                                <Button type="submit" className="text-md font-bold bg-blue-100 rounded-full px-10 py-5" onClick={handleSubmit}>Log In</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            {/* Sign up dialog */}
            <Dialog open={signUp} onOpenChange={setSignUp}>
                <DialogContent className="max-w-sm bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-base text-xl">Create an account</DialogTitle>
                        <DialogDescription className="text-base md:text-sm">Please enter your information below.</DialogDescription>
                    </DialogHeader>
                    <SignUpForm />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Login
