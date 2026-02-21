import { useState, useEffect, useMemo } from "react";
import { Puzzle, Search } from "lucide-react";
import { api, type StorePluginInfo } from "../api/index.js";
import { usePluginContext } from "../context/PluginContext.js";
import { PluginCard } from "../components/PluginCard.js";

interface PluginStoreProps {
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
}

export function PluginStore({
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
}: PluginStoreProps) {
  const [storePlugins, setStorePlugins] = useState<StorePluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [installing, setInstalling] = useState<Set<string>>(new Set());
  const [uninstalling, setUninstalling] = useState<Set<string>>(new Set());
  const [activating, setActivating] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { plugins: installedPlugins, refreshPlugins } = usePluginContext();
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;

  const setSearchQuery = (value: string) => {
    if (controlledSearchQuery === undefined) {
      setInternalSearchQuery(value);
    }
    onSearchQueryChange?.(value);
  };

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await api.getPluginStore();
        setStorePlugins(data.plugins ?? []);
      } catch {
        // Non-critical
      }
      setLoading(false);
    };
    fetchStore();
  }, []);

  const installedIds = new Set(installedPlugins.map((p) => p.id));
  const builtinPluginIds = new Set(installedPlugins.filter((p) => p.builtin).map((p) => p.id));

  // Inactive built-in extensions
  const inactiveBuiltins = installedPlugins.filter((p) => p.builtin && !p.enabled);

  // Filter built-in plugin IDs from community store list
  const communityStorePlugins = useMemo(() => {
    const filtered = storePlugins.filter((p) => !builtinPluginIds.has(p.id));
    if (!searchQuery.trim()) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [storePlugins, searchQuery, builtinPluginIds]);

  const handleInstall = async (plugin: StorePluginInfo) => {
    if (!plugin.downloadUrl) {
      setError(`No download URL available for ${plugin.name}`);
      return;
    }

    setError(null);
    setInstalling((prev) => new Set(prev).add(plugin.id));

    try {
      await api.installPlugin(plugin.id, plugin.downloadUrl);
      await refreshPlugins();
    } catch (err) {
      setError(
        `Failed to install ${plugin.name}: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    } finally {
      setInstalling((prev) => {
        const next = new Set(prev);
        next.delete(plugin.id);
        return next;
      });
    }
  };

  const handleUninstall = async (pluginId: string) => {
    setError(null);
    setUninstalling((prev) => new Set(prev).add(pluginId));

    try {
      await api.uninstallPlugin(pluginId);
      await refreshPlugins();
    } catch (err) {
      setError(`Failed to uninstall: ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      setUninstalling((prev) => {
        const next = new Set(prev);
        next.delete(pluginId);
        return next;
      });
    }
  };

  const handleActivateBuiltin = async (pluginId: string) => {
    setError(null);
    setActivating((prev) => new Set(prev).add(pluginId));

    try {
      await api.togglePlugin(pluginId);
      await refreshPlugins();
    } catch (err) {
      setError(`Failed to activate: ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      setActivating((prev) => {
        const next = new Set(prev);
        next.delete(pluginId);
        return next;
      });
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Puzzle size={24} className="text-accent" />
        <h1 className="text-xl md:text-2xl font-bold text-on-surface">Plugin Store</h1>
      </div>
      <p className="text-on-surface-muted mb-4 text-sm">Browse and manage extensions for Saydo.</p>

      <div className="mb-6 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search plugins..."
          className="w-full max-w-md pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-surface text-on-surface placeholder-on-surface-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Built-in Extensions */}
      {inactiveBuiltins.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-on-surface mb-3">Built-in Extensions</h2>
          <p className="text-on-surface-muted text-xs mb-3">
            These extensions ship with Saydo. Activate them with one click.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveBuiltins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                mode="store"
                plugin={{
                  id: plugin.id,
                  name: plugin.name,
                  description: plugin.description,
                  author: plugin.author,
                  version: plugin.version,
                  repository: "",
                  tags: [],
                  minSaydoVersion: "0.1.0",
                  icon: plugin.icon,
                }}
                expanded={expandedId === plugin.id}
                onToggleExpand={() => toggleExpanded(plugin.id)}
                installed={false}
                installing={false}
                uninstalling={false}
                onInstall={() => {}}
                onUninstall={() => {}}
                isBuiltin
                activating={activating.has(plugin.id)}
                onActivate={() => handleActivateBuiltin(plugin.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Community Plugins */}
      <section>
        <h2 className="text-base font-semibold text-on-surface mb-3">Community Plugins</h2>
        {loading ? (
          <p className="text-on-surface-muted">Loading plugins...</p>
        ) : communityStorePlugins.length === 0 ? (
          <p className="text-on-surface-muted">
            {searchQuery ? "No plugins match your search." : "No community plugins available."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityStorePlugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                mode="store"
                plugin={plugin}
                expanded={expandedId === plugin.id}
                onToggleExpand={() => toggleExpanded(plugin.id)}
                installed={installedIds.has(plugin.id)}
                installing={installing.has(plugin.id)}
                uninstalling={uninstalling.has(plugin.id)}
                onInstall={() => handleInstall(plugin)}
                onUninstall={() => handleUninstall(plugin.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
