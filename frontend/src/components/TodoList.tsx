import Button from "./ui/Button";

const TodoList = () => {
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

      <div
        key="1"
        className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100"
      >
        <p className="w-full font-semibold">1 - New todo</p>
        <div className="flex items-center justify-end w-full space-x-3">
          <Button variant="default" size="sm">
            Edit
          </Button>
          <Button variant="danger" size="sm">
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
