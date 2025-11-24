import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 h-1/2 w-3/4 bg-primary-purple/20 dark:bg-primary-purple/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-1/4 right-0 h-1/2 w-1/2 bg-primary-purple/20 dark:bg-primary-purple/10 rounded-full blur-3xl opacity-40" />
      </div>

      <main className="relative z-10 flex w-full max-w-md flex-col items-center justify-center px-4 py-8 text-center sm:py-12">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg
            className="text-primary-purple"
            fill="none"
            height="32"
            viewBox="0 0 32 32"
            width="32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 3.5C9.09644 3.5 3.5 9.09644 3.5 16C3.5 22.9036 9.09644 28.5 16 28.5C22.9036 28.5 28.5 22.9036 28.5 16C28.5 9.09644 22.9036 3.5 16 3.5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            <path
              d="M16 10.5V16L21.5 18.75"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          </svg>
          <h1 className="text-4xl font-extrabold text-foreground">Loomi</h1>
        </div>

        {/* Headline */}
        <h2 className="text-foreground tracking-tight text-3xl sm:text-4xl font-bold leading-tight pb-10">
          Your community is waiting.
        </h2>

        {/* Social Login Buttons */}
        <div className="flex w-full flex-col items-stretch gap-3">
          <Button variant="glass" className="h-14">
            <img
              alt="Google logo"
              className="w-6 h-6 mr-3"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9T9UJ3K3vJRLUIPcc1JmBNS_qcbpDVizFqdNMptXEqbvbNcTVDMYlo7p0Fxn6IzIajLm67D8-D1SPORQ1zzOiPFNyhKdhpsiChbJDbGgngjKdioyqISv0NkGjg2TbierQWj8LikJGZYozUywYoRMc22XlviM5ufxHViLDmADk4chn90bbU5r3BONkvsfMrywiE7qrArY-YW9UYBIMkMaKiyySMr12RJdrPZq0Y8Q6sDjf47fuoLLGMeUoHRBZwPRlg99CU09J3GM"
            />
            <span className="truncate">Continue with Google</span>
          </Button>
          
          <Button variant="glass" className="h-14">
            <img
              alt="Apple logo"
              className="w-6 h-6 mr-3 dark:invert"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUCYBkm3OsnEjLxISQlOJVCy92am-vAaGekx0Ny0yixWGd62TB9b3pqnYss1xE1cKtHMN3d20phb-A7XCJ7AlwM2O6ekUi9vkaGK3SbK0qn3GkjcC30_FazD-trFdy5eqAkZf967A3OSacnc5KCai_TbPKkgubtHPJ9rXw9VqWACwBUb1KEfLAAu-CL7S2zCrxxr-o6CNGRZNIZNuGYa0aN8WJC3kFfly6TeAFZJL8Z1u5GQM1pCp6dBMAOoCCBWgrn4jXL4I7KoI"
            />
            <span className="truncate">Continue with Apple</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center w-full my-6">
          <div className="flex-grow border-t border-border" />
          <span className="mx-4 flex-shrink text-sm text-muted-foreground">or</span>
          <div className="flex-grow border-t border-border" />
        </div>

        {/* Email Sign Up */}
        <div className="flex w-full flex-col items-stretch gap-3">
          <Button 
            variant="primary-purple" 
            className="h-14"
            onClick={() => navigate("/topics")}
          >
            <span className="truncate">Sign up with Email</span>
          </Button>
        </div>

        {/* Login Link */}
        <p className="text-muted-foreground text-sm font-normal leading-normal pt-8 underline cursor-pointer hover:text-foreground transition-smooth">
          Already have an account? Log in
        </p>

        {/* Legal */}
        <p className="text-muted-foreground text-xs font-normal leading-normal pt-12 max-w-xs">
          By signing up you agree to our{" "}
          <a className="font-medium underline hover:text-foreground transition-smooth" href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="font-medium underline hover:text-foreground transition-smooth" href="#">
            Privacy Policy
          </a>
          .
        </p>
      </main>
    </div>
  );
};

export default Onboarding;
