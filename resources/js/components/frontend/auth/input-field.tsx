import { Eye, EyeOff } from 'lucide-react';

// Composant de champ d'entrée réutilisable
export const InputField = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  autoComplete = 'on',
  placeholder,
  icon: Icon,
  error,
  helperText,
  isValid,
  showPassword,
  togglePasswordVisibility,
  readOnly = false,
}: any) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {placeholder} {required && <span className="text-[#DA2E29]">*</span>}
      </label>
      <div className="relative rounded-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={id}
          name={name}
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          readOnly={readOnly}
          className={`block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800/60 border ${
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
              : isValid
                ? 'border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500'
                : 'border-gray-200 dark:border-gray-700 focus:ring-[#DA2E29] focus:border-[#DA2E29]'
          } ${readOnly ? 'cursor-not-allowed opacity-75' : ''} rounded-lg shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          placeholder={placeholder}
        />
        {type === 'password' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {!error && helperText && <p className="ux-field-help">{helperText}</p>}
    </div>
  );
};
