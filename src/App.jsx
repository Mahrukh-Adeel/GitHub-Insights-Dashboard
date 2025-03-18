import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Sun, Moon, Search, Filter, Calendar, Star, GitFork, Code, Users, Activity, Github, Heart, Coffee } from "lucide-react";

const App = () => {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [sortOption, setSortOption] = useState("updated");
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [contributionData, setContributionData] = useState([]);

  // Language colors
  const languageColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    "C++": "#f34b7d",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Ruby: "#701516",
    Go: "#00ADD8",
    PHP: "#4F5D95",
    C: "#555555",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
    Rust: "#dea584",
    Dart: "#00B4AB"
  };

  // Theme colors
  const theme = {
    dark: {
      background: "bg-purple-950",
      cardBg: "bg-purple-900",
      secondaryBg: "bg-purple-800",
      accent: "bg-purple-600",
      accentHover: "bg-purple-500",
      text: "text-purple-50",
      textSecondary: "text-purple-300",
      border: "border-purple-800",
      chartGrid: "#4B2D83",
      chartLine: "#A78BFA"
    },
    light: {
      background: "bg-purple-50",
      cardBg: "bg-white",
      secondaryBg: "bg-purple-100",
      accent: "bg-purple-500",
      accentHover: "bg-purple-400",
      text: "text-purple-900",
      textSecondary: "text-purple-700",
      border: "border-purple-200",
      chartGrid: "#E9D5FF",
      chartLine: "#8B5CF6"
    }
  };

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Filter and sort repos when dependencies change
  useEffect(() => {
    if (repos.length > 0) {
      let filtered = [...repos];
      
      // Apply text filter
      if (filterText) {
        filtered = filtered.filter(repo => 
          repo.name.toLowerCase().includes(filterText.toLowerCase()) || 
          (repo.description && repo.description.toLowerCase().includes(filterText.toLowerCase()))
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortOption) {
          case "stars":
            return b.stargazers_count - a.stargazers_count;
          case "forks":
            return b.forks_count - a.forks_count;
          case "name":
            return a.name.localeCompare(b.name);
          case "updated":
          default:
            return new Date(b.updated_at) - new Date(a.updated_at);
        }
      });
      
      setFilteredRepos(filtered);
    }
  }, [repos, filterText, sortOption]);

  // Generate mock contribution data when user data loads
  useEffect(() => {
    if (userData) {
      // Generate a mock contribution chart based on user data
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      const data = [];
      for (let i = 0; i < 26; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (i * 7)); // Weekly data points
        
        // Create somewhat realistic contribution pattern based on repo count
        const baseContributions = Math.floor(userData.public_repos / 5) || 1;
        const randomFactor = Math.random() * baseContributions * 2;
        const contributions = Math.max(0, Math.floor(baseContributions + randomFactor));
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          contributions
        });
      }
      
      setContributionData(data);
    }
  }, [userData]);

  const fetchGitHubData = async () => {
    if (!username) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userRes = await axios.get(`https://api.github.com/users/${username}`);
      const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
      
      setUserData(userRes.data);
      setRepos(reposRes.data);
      setFilteredRepos(reposRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.response?.status === 404 
        ? "User not found. Please check the username and try again." 
        : "An error occurred while fetching data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Get language distribution for pie chart
  const getLanguageStats = () => {
    const languages = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    
    return Object.entries(languages)
      .map(([name, count]) => ({
        name,
        value: count,
        color: languageColors[name] || "#" + Math.floor(Math.random()*16777215).toString(16)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${currentTheme.background} ${currentTheme.text}`}>
      {/* Header */}
      <motion.div 
        className={`px-6 py-4 ${currentTheme.cardBg} shadow-lg flex justify-between items-center`}
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <motion.h1 
          className="text-2xl font-bold flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <Github className="mr-2" /> GitHub Insights Dashboard
        </motion.h1>
        <motion.button 
          onClick={() => setDarkMode(!darkMode)} 
          className={`p-2 rounded-full ${currentTheme.secondaryBg} hover:${currentTheme.accent} transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </motion.div>

      {/* Search Bar */}
      <div className={`p-8 ${currentTheme.cardBg} mb-6 shadow-lg`}>
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-2">
            <div className={`flex-1 flex items-center px-3 rounded-lg border ${currentTheme.border} ${currentTheme.secondaryBg}`}>
              <Search size={20} className={`${currentTheme.textSecondary} mr-2`} />
              <input
                type="text"
                className={`w-full p-3 outline-none ${currentTheme.secondaryBg} ${currentTheme.text}`}
                placeholder="Enter GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchGitHubData()}
              />
            </div>
            <motion.button
              onClick={fetchGitHubData}
              className={`px-6 py-3 rounded-lg font-medium ${currentTheme.accent} hover:${currentTheme.accentHover} text-white transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Fetch Profile
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              className="flex justify-center my-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 border-4 border-t-purple-500 rounded-full animate-spin ${darkMode ? "border-purple-800" : "border-purple-200"}`}></div>
                <p className="mt-4 text-lg">Fetching GitHub data...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div 
              className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-red-900/30" : "bg-red-100"} border ${darkMode ? "border-red-800" : "border-red-200"} text-center`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className={darkMode ? "text-red-200" : "text-red-600"}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {userData && !loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* User Profile */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className={`p-6 rounded-2xl shadow-lg ${currentTheme.cardBg} flex flex-col md:flex-row items-center md:items-start gap-6`}>
                <motion.img 
                  src={userData.avatar_url} 
                  alt="Avatar" 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-purple-500 shadow-lg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                />
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{userData.name || userData.login}</h2>
                      <p className={`text-lg ${currentTheme.textSecondary}`}>@{userData.login}</p>
                    </div>
                    
                    {userData.html_url && (
                      <motion.a 
                        href={userData.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`mt-4 md:mt-0 px-4 py-2 rounded-lg ${currentTheme.accent} hover:${currentTheme.accentHover} text-white font-medium transition-colors`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View on GitHub
                      </motion.a>
                    )}
                  </div>
                  
                  <p className="my-3">{userData.bio}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className={`p-3 rounded-lg ${currentTheme.secondaryBg} flex items-center`}>
                      <Code className="mr-2" size={18} />
                      <div>
                        <div className="font-bold">{userData.public_repos}</div>
                        <div className="text-sm text-gray-400">Repositories</div>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${currentTheme.secondaryBg} flex items-center`}>
                      <Users className="mr-2" size={18} />
                      <div>
                        <div className="font-bold">{userData.followers}</div>
                        <div className="text-sm text-gray-400">Followers</div>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${currentTheme.secondaryBg} flex items-center`}>
                      <Star className="mr-2" size={18} />
                      <div>
                        <div className="font-bold">{userData.following}</div>
                        <div className="text-sm text-gray-400">Following</div>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${currentTheme.secondaryBg} flex items-center`}>
                      <Calendar className="mr-2" size={18} />
                      <div>
                        <div className="font-bold">{new Date(userData.created_at).getFullYear()}</div>
                        <div className="text-sm text-gray-400">Joined GitHub</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className={`flex overflow-x-auto ${currentTheme.border} border-b`}>
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-3 font-medium ${activeTab === "overview" 
                    ? `border-b-2 border-purple-500 text-purple-400` 
                    : currentTheme.textSecondary}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab("repositories")}
                  className={`px-4 py-3 font-medium ${activeTab === "repositories" 
                    ? `border-b-2 border-purple-500 text-purple-400` 
                    : currentTheme.textSecondary}`}
                >
                  Repositories
                </button>
                <button 
                  onClick={() => setActiveTab("stats")}
                  className={`px-4 py-3 font-medium ${activeTab === "stats" 
                    ? `border-b-2 border-purple-500 text-purple-400` 
                    : currentTheme.textSecondary}`}
                >
                  Statistics
                </button>
              </div>
            </motion.div>

            {/* Overview Tab */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeVariants}
                >
                  <motion.div variants={itemVariants} className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Activity Overview</h3>
                    <div className={`p-4 rounded-2xl shadow-lg ${currentTheme.cardBg}`}>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={contributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.chartGrid} />
                            <XAxis 
                              dataKey="date" 
                              stroke={currentTheme.textSecondary}
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => value.split(' ')[0]}
                            />
                            <YAxis 
                              stroke={currentTheme.textSecondary}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: darkMode ? '#2D1A45' : '#FFFFFF',
                                border: darkMode ? '1px solid #4C1D95' : '1px solid #E9D5FF',
                                color: darkMode ? '#F3F4F6' : '#1F2937'
                              }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="contributions" 
                              stroke={currentTheme.chartLine}
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <h3 className="text-xl font-bold mb-4">Popular Repositories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {repos
                        .sort((a, b) => b.stargazers_count - a.stargazers_count)
                        .slice(0, 4)
                        .map(repo => (
                          <motion.div 
                            key={repo.id} 
                            className={`p-4 rounded-2xl shadow-lg ${currentTheme.cardBg}`}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                          >
                            <h4 className="text-lg font-bold truncate">{repo.name}</h4>
                            <p className={`text-sm ${currentTheme.textSecondary} h-12 overflow-hidden`}>
                              {repo.description || "No description available"}
                            </p>
                            
                            <div className="flex items-center mt-4">
                              {repo.language && (
                                <div className="flex items-center mr-4">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-1" 
                                    style={{ 
                                      backgroundColor: languageColors[repo.language] || "#" + Math.floor(Math.random()*16777215).toString(16)
                                    }}
                                  ></div>
                                  <span className="text-sm">{repo.language}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center mr-4">
                                <Star size={14} className="mr-1" />
                                <span className="text-sm">{repo.stargazers_count}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <GitFork size={14} className="mr-1" />
                                <span className="text-sm">{repo.forks_count}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Repositories Tab */}
              {activeTab === "repositories" && (
                <motion.div
                  key="repositories"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeVariants}
                >
                  <motion.div variants={itemVariants} className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className={`flex-1 flex items-center px-3 rounded-lg ${currentTheme.cardBg} border ${currentTheme.border}`}>
                        <Search size={18} className={currentTheme.textSecondary} />
                        <input
                          type="text"
                          className={`w-full p-2 outline-none ${currentTheme.cardBg} ${currentTheme.text}`}
                          placeholder="Filter repositories..."
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                        />
                      </div>

                      <div className="flex">
                        <div className={`flex items-center ${currentTheme.cardBg} ${currentTheme.border} border rounded-lg overflow-hidden`}>
                          <Filter size={18} className={`ml-3 ${currentTheme.textSecondary}`} />
                          <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className={`p-2 outline-none cursor-pointer ${currentTheme.cardBg} ${currentTheme.text}`}
                          >
                            <option value="updated">Recently Updated</option>
                            <option value="stars">Most Stars</option>
                            <option value="forks">Most Forks</option>
                            <option value="name">Name</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} layout>
                    <p className="text-sm mb-4">
                      {filteredRepos.length} repositories found
                    </p>
                    
                    <AnimatePresence>
                      {filteredRepos.length === 0 && (
                        <motion.div 
                          className={`p-8 text-center rounded-lg ${currentTheme.cardBg}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <p>No repositories match your filter criteria.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <AnimatePresence>
                        {filteredRepos.map(repo => (
                          <motion.div 
                            key={repo.id} 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-4 rounded-2xl shadow-lg ${currentTheme.cardBg}`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div>
                                <h4 className="text-lg font-bold">{repo.name}</h4>
                                <p className={`${currentTheme.textSecondary} mt-1`}>
                                  {repo.description || "No description available"}
                                </p>
                                
                                <div className="flex flex-wrap items-center mt-3 gap-3">
                                  {repo.language && (
                                    <div className="flex items-center">
                                      <div 
                                        className="w-3 h-3 rounded-full mr-1" 
                                        style={{ 
                                          backgroundColor: languageColors[repo.language] || "#" + Math.floor(Math.random()*16777215).toString(16)
                                        }}
                                      ></div>
                                      <span className="text-sm">{repo.language}</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center">
                                    <Star size={14} className="mr-1" />
                                    <span className="text-sm">{repo.stargazers_count}</span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <GitFork size={14} className="mr-1" />
                                    <span className="text-sm">{repo.forks_count}</span>
                                  </div>
                                  
                                  <div className="text-sm">
                                    Updated {new Date(repo.updated_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              
                              <motion.a 
                                href={repo.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`mt-3 md:mt-0 px-3 py-1 rounded-lg text-sm ${currentTheme.accent} hover:${currentTheme.accentHover} text-white transition-colors`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View Repo
                              </motion.a>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Stats Tab */}
              {activeTab === "stats" && (
                <motion.div
                  key="stats"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeVariants}
                >
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-2xl shadow-lg ${currentTheme.cardBg}`}>
                      <h3 className="text-lg font-bold mb-4">Top Languages</h3>
                      
                      {getLanguageStats().length > 0 ? (
                        <div className="space-y-3">
                          {getLanguageStats().map(lang => (
                            <div key={lang.name} className="flex flex-col">
                              <div className="flex justify-between mb-1">
                                <span>{lang.name}</span>
                                <span>{((lang.value / repos.length) * 100).toFixed(1)}%</span>
                              </div>
                              <div className={`w-full h-2 rounded-full ${currentTheme.secondaryBg}`}>
                                <motion.div 
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: lang.color, width: 0 }}
                                  animate={{ width: `${(lang.value / repos.length) * 100}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-4">No language data available</p>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-2xl shadow-lg ${currentTheme.cardBg}`}>
                      <h3 className="text-lg font-bold mb-4">Repository Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Recently Updated</span>
                          <span className="font-bold">{repos.filter(r => {
                            const date = new Date(r.updated_at);
                            const now = new Date();
                            const monthAgo = new Date();
                            monthAgo.setMonth(now.getMonth() - 1);
                            return date > monthAgo;
                          }).length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>Starred Repositories</span>
                          <span className="font-bold">{repos.filter(r => r.stargazers_count > 0).length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>Forked Repositories</span>
                          <span className="font-bold">{repos.filter(r => r.forks_count > 0).length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>Repositories with Issues</span>
                          <span className="font-bold">{repos.filter(r => r.open_issues_count > 0).length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-2xl shadow-lg ${currentTheme.cardBg} md:col-span-2`}>
                      <h3 className="text-lg font-bold mb-4">Stars Timeline</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={repos
                              .filter(repo => repo.stargazers_count > 0)
                              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                              .slice(0, 10)
                              .map(repo => ({
                                name: repo.name,
                                stars: repo.stargazers_count,
                                created: new Date(repo.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                              }))
                            }
                            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.chartGrid} />
                            <XAxis
                              dataKey="created"
                              stroke={currentTheme.textSecondary}
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                            />
                            <YAxis
                              stroke={currentTheme.textSecondary}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? '#2D1A45' : '#FFFFFF',
                                border: darkMode ? '1px solid #4C1D95' : '1px solid #E9D5FF',
                                color: darkMode ? '#F3F4F6' : '#1F2937'
                              }}
                              formatter={(value, name, props) => [value, props.payload.name]}
                              labelFormatter={(value) => `Created: ${value}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="stars"
                              stroke={currentTheme.chartLine}
                              strokeWidth={2}
                              dot={{ r: 4, strokeWidth: 2 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.footer 
        className={`mt-auto py-6 ${currentTheme.secondaryBg} border-t ${currentTheme.border}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Github size={20} className={`mr-2 ${currentTheme.textSecondary}`} />
            <p className={`text-sm ${currentTheme.textSecondary}`}>
              GitHub Insights Dashboard | 2025
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <motion.a
              href="https://github.com/Mahrukh-Adeel/GitHub-Insights-Dashboard/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${currentTheme.textSecondary} flex items-center hover:text-purple-400 transition-colors`}
              whileHover={{ scale: 1.1 }}
            >
              <Star size={18} className="mr-1" /> Star
            </motion.a>
            
            {/* <motion.a
              href="https://buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${currentTheme.textSecondary} flex items-center hover:text-purple-400 transition-colors`}
              whileHover={{ scale: 1.1 }}
            >
              <Coffee size={18} className="mr-1" /> Support
            </motion.a>
            
            <motion.a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${currentTheme.textSecondary} flex items-center hover:text-purple-400 transition-colors`}
              whileHover={{ scale: 1.1 }}
            >
              <Heart size={18} className="mr-1" /> Follow
            </motion.a> */}
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default App;
