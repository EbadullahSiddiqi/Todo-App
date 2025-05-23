"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Todo {
  id: number;
  task: string;
  is_complete: boolean;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/get-todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const result = await response.json();
      if (result.data) {
        setTodos(result.data);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newTodo.trim().length <= 3) {
      setError("Todo must be longer than 3 characters");
      return;
    }

    try {
      const response = await fetch("/api/create-todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ todo: newTodo.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create todo");
      }

      const result = await response.json();

      if (result.data) {
        setTodos([...todos, result.data[0]]);
        setNewTodo("");
      }
    } catch (error) {
      console.error("Error creating todo:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create todo"
      );
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, is_complete: !todo.is_complete } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            Loading todos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            My Todo List
          </h1>

          <form onSubmit={addTodo} className="mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new todo..."
                  className="flex-1 px-4 py-2 rounded-lg border text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <PlusCircle size={20} />
                  Add
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </form>

          <div className="space-y-3">
            {todos.map((todo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`p-1 rounded-full ${
                      todo.is_complete ? "text-green-500" : "text-gray-400"
                    }`}
                  >
                    <CheckCircle2 size={24} />
                  </button>
                  <span
                    className={`text-lg ${
                      todo.is_complete
                        ? "line-through text-gray-500"
                        : "text-gray-800"
                    }`}
                  >
                    {todo.task}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {todos.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No todos yet. Add one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
