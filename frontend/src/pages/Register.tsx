import { useForm, SubmitHandler } from "react-hook-form";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

interface IFormInput {
  username: string;
  email: string;
  password: string;
}

const RegisterPage = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = (data) => console.log(data);

  console.log(errors);

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center mb-4 text-3xl font-semibold">
        Register to get access!
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Username"
          {...register("username", { required: "Username is required" })}
        />
        <p className="text-red-600">{errors?.username?.message}</p>
        <Input
          {...register("email", { required: "Email is required" })}
          placeholder="Email address"
        />
        <Input
          {...register("password", { required: "Password is required" })}
          placeholder="Password"
        />
        <Button fullWidth>Register</Button>
      </form>
    </div>
  );
};

export default RegisterPage;
