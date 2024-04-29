import Button from "./ui/Button";
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
import useCustomQuery from "../hooks/useCustomQuery.ts";
// import { faker } from "@faker-js/faker";

const TodoList = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const [queryVersion, setQueryVersion] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: "",
  });
  const [todoToAdd, setTodoToAdd] = useState({
    title2: "",
    description2: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField: resetField1,
  } = useForm<ITodo>({
    mode: "onChange",
  });

  const {
    register: register2,
    formState: { errors: errors2 },
    handleSubmit: handleSubmit2,
    resetField: resetField2,
  } = useForm({
    mode: "onChange",
  });

  //////////////////////////////////////////////////////////////////////////////////////////////
  const { isLoading, data } = useCustomQuery({
    queryKey: ["todoList", `${queryVersion}`],
    url: "/users/me?populate=todos",
    config: {
      headers: {
        Authorization: `Bearer ${userData?.jwt}`,
      },
    },
  });

  //////////////////////////////////////////////////////////////////////////////////////////////
  const onCloseAddModal = () => {
    setTodoToAdd({
      title2: "",
      description2: "",
    });
    setIsOpenAddModal(false);
  };

  const onOpenAddModal = () => {
    setTodoToAdd({
      title2: "",
      description2: "",
    });
    setIsOpenAddModal(true);
  };

  const onChangeAddHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = event.target;
    setTodoToAdd({
      ...todoToAdd,
      [name]: value,
    });
  };

  const submitAddHandler = async () => {
    setIsAdding(true);
    const { title2, description2 } = todoToAdd;
    try {
      const { status } = await axiosInstance.post(
        `/todos`,
        {
          data: {
            title: title2,
            description: description2,
            user: [userData.user.id],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${userData?.jwt}`,
          },
        }
      );

      if (status === 200) {
        setQueryVersion((prev) => prev + 1);
        onCloseAddModal();
        resetField2("title2");
        resetField2("description2");

        toast.success("Todo added successfuly!", {
          position: "bottom-center",
          duration: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAdding(false);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
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

  const onChangeEditHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = event.target;
    setTodoToEdit({
      ...todoToEdit,
      [name]: value,
    });
  };

  const submitEditHandler: SubmitHandler<ITodo> = async () => {
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
        setQueryVersion((prev) => prev + 1);
        onCloseEditModal();
        resetField1("title");
        resetField1("description");
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

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  const onRemove = async () => {
    try {
      const { status } = await axiosInstance.delete(`/todos/${todoToEdit.id}`, {
        headers: {
          Authorization: `Bearer ${userData?.jwt}`,
        },
      });

      if (status === 200) {
        setQueryVersion((prev) => prev + 1);
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

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // const onGeneratesTodos = async () => {
  //   for (let i = 0; i < 25; i++) {
  //     try {
  //       const { data } = await axiosInstance.post(
  //         `/todos`,
  //         {
  //           data: {
  //             title: faker.word.words(2),
  //             description: faker.lorem.paragraph(2),
  //             user: [userData.user.id],
  //           },
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${userData?.jwt}`,
  //           },
  //         }
  //       );
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // };

  /////////////////////////////////////////////////////////////////////////////////////////////////
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
      <div className="w-fit mx-auto my-10">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-32 h-9 bg-gray-300 rounded-md dark:bg-gray-400"></div>
            {/* <div className="w-32 h-9 bg-gray-300 rounded-md dark:bg-gray-400"></div> */}
          </div>
        ) : (
          <div className="flex w-fit mx-auto my-10 gap-x-2">
            <Button
              onClick={onOpenAddModal}
              type="button"
              variant="default"
              size="sm"
            >
              Post new todo
            </Button>
            {/* <Button onClick={onGeneratesTodos} variant="outline" size="sm">
              Generate todos
            </Button> */}
          </div>
        )}
      </div>

      {data?.todos?.length ? (
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
                onClick={() => {
                  onOpenEditModal(todo);
                  resetField1("title");
                  resetField1("description");
                }}
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
      {/* Add todo modal */}
      <Modal
        isOpen={isOpenAddModal}
        closeModal={onCloseAddModal}
        title="Add a new todo"
      >
        <form
          key={1}
          className="space-y-3"
          onSubmit={handleSubmit2(submitAddHandler)}
        >
          <Input
            // value={todoToAdd.title2}
            {...register2("title2", {
              required: true,
              minLength: 3,
              maxLength: 20,
              onChange: (e) => {
                onChangeAddHandler(e);
              },
            })}
          />
          {errors2.title2?.type === "required" && (
            <InputErrorMessage msg="Todo title is required" />
          )}
          {errors2.title2?.type === "minLength" && (
            <InputErrorMessage msg="Todo title should be at least 3 characters" />
          )}
          {errors2.title2?.type === "maxLength" && (
            <InputErrorMessage msg="Todo description should be less than 20 characters" />
          )}
          <Textarea
            // value={todoToAdd.description2}
            {...register2("description2", {
              minLength: 20,
              onChange: (e) => {
                onChangeAddHandler(e);
              },
            })}
          />
          {errors2.description2?.type === "minLength" && (
            <InputErrorMessage msg="Todo description should be at least 20 characters" />
          )}
          <div className="flex items-center space-x-3 mt-4">
            <Button isLoading={isAdding}>
              {isAdding ? "Loading..." : "Add"}
            </Button>{" "}
            <Button variant={"cancel"} type="button" onClick={onCloseAddModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      {/* Edit todo modal */}
      <Modal
        isOpen={isEditModalOpen}
        closeModal={onCloseEditModal}
        title="Edit Todo"
      >
        <form
          key={2}
          className="space-y-3"
          onSubmit={handleSubmit(submitEditHandler)}
        >
          <Input
            value={todoToEdit.title}
            {...register("title", {
              required: true,
              minLength: 3,
              maxLength: 20,
              onChange: (e) => {
                onChangeEditHandler(e);
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
                onChangeEditHandler(e);
              },
            })}
          />
          {errors.description?.type === "minLength" && (
            <InputErrorMessage msg="Todo description should be at least 20 characters" />
          )}
          <div className="flex items-center space-x-3 mt-4">
            <Button isLoading={isUpdating}>
              {isUpdating ? "Loading..." : "Update"}
            </Button>{" "}
            <Button variant={"cancel"} type="button" onClick={onCloseEditModal}>
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
      </Modal>
    </div>
  );
};

export default TodoList;
