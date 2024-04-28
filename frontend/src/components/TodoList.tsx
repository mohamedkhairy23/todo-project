import Button from "./ui/Button";
import useAuthenticatedQuery from "../hooks/useAuthenticatedQuery";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { ChangeEvent, useState } from "react";
import Textarea from "./ui/Textarea";
import { SubmitHandler, useForm } from "react-hook-form";
import { ITodo } from "../interfaces";
import InputErrorMessage from "./ui/InputErrorMessage";
import axiosInstance from "../config/axios.config";
import toast from "react-hot-toast";
import TodoSkeleton from "./TodoSkeleton";

const TodoList = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ITodo>({
    mode: "onChange",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);

  const { isLoading, data } = useAuthenticatedQuery({
    queryKey: ["todoList", `${todoToEdit.id}`],
    url: "/users/me?populate=todos",
    config: {
      headers: {
        Authorization: `Bearer ${userData?.jwt}`,
      },
    },
  });

  const onCloseEditModal = () => {
    setTodoToEdit({
      id: 0,
      title: "",
      description: "",
    });
    setIsEditModalOpen(false);
  };
  const onOpenEditModal = (todo: ITodo) => {
    setTodoToEdit(todo);
    setIsEditModalOpen(true);
  };

  const closeConfirmModal = () => {
    setTodoToEdit({
      id: 0,
      title: "",
      description: "",
    });
    setIsOpenConfirmModal(false);
  };
  const openConfirmModal = (todo: ITodo) => {
    setTodoToEdit(todo);
    setIsOpenConfirmModal(true);
  };

  const onChangeHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = event.target;
    setTodoToEdit({
      ...todoToEdit,
      [name]: value,
    });
  };

  const onRemove = async () => {
    try {
      const { status } = await axiosInstance.delete(`/todos/${todoToEdit.id}`, {
        headers: {
          Authorization: `Bearer ${userData?.jwt}`,
        },
      });

      if (status === 200) {
        closeConfirmModal();
        toast.success("Todo deleted successfuly!", {
          position: "bottom-center",
          duration: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler: SubmitHandler<ITodo> = async () => {
    setIsUpdating(true);
    const { title, description } = todoToEdit;
    try {
      const { status } = await axiosInstance.put(
        `/todos/${todoToEdit.id}`,
        { data: { title: title, description: description } },
        {
          headers: {
            Authorization: `Bearer ${userData?.jwt}`,
          },
        }
      );
      if (status === 200) {
        onCloseEditModal();
        toast.success("Todo updated successfuly!", {
          position: "bottom-center",
          duration: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading)
    return (
      <div className="space-y-1 p-3">
        {Array.from({ length: 10 }, () => (
          <TodoSkeleton />
        ))}
      </div>
    );

  return (
    <div className="space-y-1 ">
      <div className="flex w-fit mx-auto my-10 gap-x-2">
        <Button variant="default" size="sm">
          Post new todo
        </Button>
        <Button variant="outline" size="sm">
          Generate todos
        </Button>
      </div>
      {data.todos.length ? (
        data.todos.map((todo: ITodo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100"
          >
            <p className="w-full font-semibold">
              {todo.id} - {todo.title}
            </p>
            <div className="flex items-center justify-end w-full space-x-3">
              <Button
                onClick={() => onOpenEditModal(todo)}
                variant="default"
                size="sm"
              >
                Edit
              </Button>
              <Button
                onClick={() => openConfirmModal(todo)}
                variant="danger"
                size="sm"
              >
                Remove
              </Button>
            </div>
          </div>
        ))
      ) : (
        <h3>No todos yet!</h3>
      )}
      {/* Edit todo modal */}
      <Modal
        isOpen={isEditModalOpen}
        closeModal={onCloseEditModal}
        title="Edit Todo"
      >
        <form className="space-y-3" onSubmit={handleSubmit(submitHandler)}>
          <Input
            value={todoToEdit.title}
            {...register("title", {
              required: true,
              minLength: 3,
              maxLength: 20,
              onChange: (e) => {
                onChangeHandler(e);
              },
            })}
          />
          {errors.title?.type === "required" && (
            <InputErrorMessage msg="Todo title is required" />
          )}
          {errors.title?.type === "minLength" && (
            <InputErrorMessage msg="Todo title should be at least 3 characters" />
          )}
          {errors.title?.type === "maxLength" && (
            <InputErrorMessage msg="Todo description should be less than 20 characters" />
          )}
          <Textarea
            value={todoToEdit.description}
            {...register("description", {
              minLength: 20,
              onChange: (e) => {
                onChangeHandler(e);
              },
            })}
          />
          {errors.description?.type === "minLength" && (
            <InputErrorMessage msg="Todo description should be at least 20 characters" />
          )}
          <div className="flex items-center space-x-3 mt-4">
            <Button isLoading={isUpdating}>
              {isLoading ? "Loading..." : "Update"}
            </Button>{" "}
            <Button variant={"cancel"} onClick={onCloseEditModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      {/* Delete todo confirm modal */}
      <Modal
        isOpen={isOpenConfirmModal}
        closeModal={closeConfirmModal}
        title="Are you sure you want to remove this todo from your store ?"
        description="Deleting this todo will remove it permenantly from your inventory. Any associated data, sales history, and other related information will also be deleted. Please make sure this is the intended action."
      >
        <div className="flex items-center space-x-3 mt-4">
          <Button variant="danger" onClick={onRemove}>
            Yes , Remove
          </Button>
          <Button variant="cancel" type="button" onClick={closeConfirmModal}>
            Cancel
          </Button>
        </div>
      </Modal>{" "}
    </div>
  );
};

export default TodoList;
