"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Joke = {
  id: number;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
};

export default function AdminDashboard() {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "upvotes" | "downvotes" | "createdAt">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [newJoke, setNewJoke] = useState("");
  const [editingJoke, setEditingJoke] = useState<Joke | null>(null);
  const router = useRouter();

  const fetchJokes = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/jokes?${params}`);
      
      if (response.status === 401) {
        router.push("/admin");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setJokes(data.jokes);
      }
    } catch (error) {
      console.error("Failed to fetch jokes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, sortBy, sortOrder, router]);

  useEffect(() => {
    void fetchJokes();
  }, [fetchJokes]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  const handleCreateJoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJoke.trim()) return;

    try {
      const response = await fetch("/api/admin/jokes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newJoke, upvotes: 0, downvotes: 0 }),
      });

      if (response.ok) {
        setNewJoke("");
        fetchJokes();
      }
    } catch (error) {
      console.error("Failed to create joke:", error);
    }
  };

  const handleUpdateJoke = async (joke: Joke) => {
    try {
      const response = await fetch(`/api/admin/jokes/${joke.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: joke.content,
          upvotes: joke.upvotes,
          downvotes: joke.downvotes,
        }),
      });

      if (response.ok) {
        setEditingJoke(null);
        fetchJokes();
      }
    } catch (error) {
      console.error("Failed to update joke:", error);
    }
  };

  const handleDeleteJoke = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort detta skämt?")) return;

    try {
      const response = await fetch(`/api/admin/jokes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchJokes();
      }
    } catch (error) {
      console.error("Failed to delete joke:", error);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 select-text">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Garva Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logga ut
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Joke Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lägg till nytt skämt</h2>
          <form onSubmit={handleCreateJoke}>
            <textarea
              value={newJoke}
              onChange={(e) => setNewJoke(e.target.value)}
              placeholder="Skriv in skämtets innehåll (stödjer flera stycken)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 min-h-[120px]"
              required
            />
            <button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
            >
              Lägg till skämt
            </button>
          </form>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sök
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök skämt..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sortera efter
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "id" | "upvotes" | "downvotes" | "createdAt")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="id">ID</option>
                <option value="upvotes">Gillningar</option>
                <option value="downvotes">Ogillamarkeringar</option>
                <option value="createdAt">Skapad datum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sorteringsordning
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="asc">Stigande</option>
                <option value="desc">Fallande</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jokes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              </div>
            ) : jokes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Inga skämt hittades. Lägg till några för att komma igång!
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Innehåll
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Gillningar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Ogillamark.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Åtgärder
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jokes.map((joke) => (
                    <tr key={joke.id} className="hover:bg-gray-50">
                      {editingJoke?.id === joke.id ? (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {joke.id}
                          </td>
                          <td className="px-6 py-4">
                            <textarea
                              value={editingJoke.content}
                              onChange={(e) =>
                                setEditingJoke({ ...editingJoke, content: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 min-h-[80px]"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editingJoke.upvotes}
                              onChange={(e) =>
                                setEditingJoke({ ...editingJoke, upvotes: parseInt(e.target.value) || 0 })
                              }
                              className="w-20 px-3 py-2 border border-gray-300 rounded text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editingJoke.downvotes}
                              onChange={(e) =>
                                setEditingJoke({ ...editingJoke, downvotes: parseInt(e.target.value) || 0 })
                              }
                              className="w-20 px-3 py-2 border border-gray-300 rounded text-gray-900"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button
                              onClick={() => handleUpdateJoke(editingJoke)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Spara
                            </button>
                            <button
                              onClick={() => setEditingJoke(null)}
                              className="text-gray-600 hover:text-gray-900 font-medium"
                            >
                              Avbryt
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {joke.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div dangerouslySetInnerHTML={{ __html: joke.content }} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {joke.upvotes}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {joke.downvotes}
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button
                              onClick={() => setEditingJoke(joke)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Redigera
                            </button>
                            <button
                              onClick={() => handleDeleteJoke(joke.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Ta bort
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
