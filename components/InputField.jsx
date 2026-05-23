import React from 'react'

const InputField = ({
  label,
  className,
  placeholder,
  inputClass,
  labelClass,
  value,
  onChange,
  type,
  readonly = false,
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full gap-1.5 font-inter ${className}`}>
      {label && (
        <label className={`text-sm font-medium text-slate-700 dark:text-slate-350 ${labelClass}`}>
          {label}
        </label>
      )}

      <input
        readOnly={readonly}
        type={type}
        placeholder={placeholder}
        value={value}           
        onChange={onChange}     
        className={`bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 outline-none p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg transition-all focus:border-indigo-550 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-550/20 dark:focus:ring-indigo-500/20 ${inputClass}`}
        {...props}
      />
    </div>
  );
}

export default InputField;

{/* <InputField                 
                // readOnly={true}
                inputClass={`rounded-lg`}
                label={`Question 3`}
                placeholder={`What's your timeline for getting started?`}
              /> */}