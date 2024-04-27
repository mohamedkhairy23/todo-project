import { useForm, SubmitHandler } from "react-hook-form";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import InputErrorMessage from "../components/ui/InputErrorMessage";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../validation";
import { LOGIN_FORM } from "../data";

interface IFormInput {
  email: string;
  password: string;
}

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data);
  };

  const renderLoginForm = LOGIN_FORM.map(
    ({ name, placeholder, type, validation }, index) => (
      <div key={index}>
        <Input
          placeholder={placeholder}
          type={type}
          {...register(name, validation)}
        />
        {errors[name] && <InputErrorMessage msg={errors[name]?.message} />}
      </div>
    )
  );
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center mb-4 text-3xl font-semibold">
        Login to get access!
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {renderLoginForm}

        <Button fullWidth>Login</Button>
      </form>
    </div>
  );
};

export default LoginPage;
