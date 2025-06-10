import { CheckCircle2 } from "lucide-react";

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const checks = [
    { label: "At least 6 characters", regex: /.{6,}/ },
    { label: "At least one uppercase letter", regex: /[A-Z]/ },
    { label: "At least one number", regex: /\d/ },
    { label: "At least one @ symbol", regex: /@/ },
  ];

  return (
    <div className="mt-2 space-y-2">
      {checks.map((check, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="relative">
            {check.regex.test(password) ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 animate-in zoom-in-50 duration-300" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-muted-foreground/50" />
            )}
          </div>
          <span
            className={`transition-colors duration-300 ${
              check.regex.test(password)
                ? "text-green-500 animate-in fade-in-50 duration-300"
                : "text-muted-foreground"
            }`}
          >
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordStrengthIndicator;
