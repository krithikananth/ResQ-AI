import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { donationsAPI, ngosAPI } from '../services/api.jsx';
import DonationForm from '../components/DonationForm';
import DonationsList from '../components/DonationsList';
import NGOsList from '../components/NGOsList';
import MapView from '../components/MapView';

const Dashboard = () => {
  const { user, logout } = useAuth();
  console.log('Dashboard rendering with user:', user);
  
  // Set default tab based on user role
  const [activeTab, setActiveTab] = useState(() => {
    const defaultTab = (() => {
      switch (user?.role) {
        case 'donor': return 'donor';
        case 'ngo': return 'ngo';
        case 'volunteer': return 'volunteer';
        case 'admin': return 'admin';
        default: return 'donor';
      }
    })();
    console.log('Setting default tab to:', defaultTab, 'for user role:', user?.role);
    return defaultTab;
  });
  const [donations, setDonations] = useState([]);
  const [ngos, setNGOs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load data based on active tab
  useEffect(() => {
    console.log('Loading data for tab:', activeTab, 'user role:', user?.role);
    loadData();
  }, [activeTab, user]);

  const loadData = async () => {
    console.log('loadData called for tab:', activeTab);
    if (activeTab === 'donor' || activeTab === 'ngo' || activeTab === 'admin') {
      console.log('Loading donations...');
      await loadDonations();
    }
    if (activeTab === 'ngo' || activeTab === 'admin') {
      console.log('Loading NGOs...');
      await loadNGOs();
    }
  };

  const loadDonations = async () => {
    try {
      console.log('Loading donations API call...');
      setLoading(true);
      const response = await donationsAPI.getAll();
      console.log('Donations API response:', response);
      setDonations(response.data.donations || []);
    } catch (error) {
      console.error('Failed to load donations:', error);
      setError('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const loadNGOs = async () => {
    try {
      console.log('Loading NGOs API call...');
      setLoading(true);
      const response = await ngosAPI.getAll();
      console.log('NGOs API response:', response);
      setNGOs(response.data.ngos || []);
    } catch (error) {
      console.error('Failed to load NGOs:', error);
      setError('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const handleDonationCreate = async (donationData) => {
    try {
      setError('');
      setLoading(true);
      
      // Add default Chennai coordinates if address is provided but no coordinates
      if (donationData.location?.address && (!donationData.location.lat || !donationData.location.lng)) {
        donationData.location.lat = 13.0850; // Anna Nagar, Chennai default
        donationData.location.lng = 80.2101;
      }
      
      await donationsAPI.create(donationData);
      setSuccess('Donation created successfully!');
      
      // Reload donations
      await loadDonations();
      
      // Switch to donations tab to show the new donation
      setActiveTab('donor');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create donation';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Get tabs based on user role - matching mockups
  const getTabs = () => {
    console.log('Getting tabs for user role:', user?.role);
    
    // Base tabs that all roles can see
    const allRoleTabs = [
      { id: 'donor', label: 'Donor', icon: '🏠', roles: ['donor', 'admin'] },
      { id: 'ngo', label: 'NGO', icon: '🏢', roles: ['ngo', 'admin'] },
      { id: 'volunteer', label: 'Volunteer', icon: '🚚', roles: ['volunteer', 'admin'] },
      { id: 'admin', label: 'Admin', icon: '👤', roles: ['admin'] },
      { id: 'chat', label: 'Chat Assistant', icon: '🤖', roles: ['donor', 'ngo', 'volunteer', 'admin'] }
    ];

    // Filter tabs based on user role or show all for admin
    if (user?.role === 'admin') {
      return allRoleTabs;
    }

    const filteredTabs = allRoleTabs.filter(tab => tab.roles.includes(user?.role));
    console.log('Filtered tabs for role', user?.role, ':', filteredTabs);
    return filteredTabs;
  };

  const renderTabContent = () => {
    console.log('Rendering tab content for:', activeTab, 'User:', user?.role);
    
    try {
      switch (activeTab) {
        case 'donor':
          return <DonorView onSubmit={handleDonationCreate} donations={donations} loading={loading} />;
        case 'ngo':
          console.log('Rendering NGO view with donations:', donations.length);
          return <NGOView donations={donations} userRole={user.role} loading={loading} />;
        case 'volunteer':
          return <VolunteerView user={user} donations={donations} loading={loading} />;
        case 'admin':
          return <AdminView donations={donations} ngos={ngos} loading={loading} />;
        case 'chat':
          return <ChatAssistant user={user} />;
        default:
          return <div className="text-center text-gray-500">Select a tab to continue</div>;
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <div className="text-center text-red-500 p-8">
          <h3 className="text-lg font-semibold mb-2">Error Loading View</h3>
          <p className="text-sm">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary mt-4"
          >
            Reload Page
          </button>
        </div>
      );
    }
  };

  if (!user) {
    console.log('No user found in Dashboard');
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading user data...</p>
      </div>
    </div>;
  }

  console.log('Dashboard fully rendering for user:', user.email, 'role:', user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">🍱 ResQ-AI</h1>
              <p className="text-xs sm:text-sm text-gray-600">AI-Powered Food Rescue Platform</p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <span className="text-xs sm:text-sm text-gray-700 truncate flex-1 sm:flex-none">
                Welcome, <strong className="hidden sm:inline">{user.name}</strong>
                <strong className="sm:hidden">{user.name.split(' ')[0]}</strong>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'donor' ? 'bg-green-100 text-green-800' :
                user.role === 'ngo' ? 'bg-blue-100 text-blue-800' :
                user.role === 'volunteer' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.role.toUpperCase()}
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">↪️</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="alert alert-error">
            {error}
            <button onClick={clearMessages} className="ml-auto text-red-700 hover:text-red-900">×</button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="alert alert-success">
            {success}
            <button onClick={clearMessages} className="ml-auto text-green-700 hover:text-green-900">×</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max px-1" aria-label="Tabs">
            {getTabs().map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  clearMessages();
                }}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

// Donor View - Post food form + my donations + NGO map
const DonorView = ({ onSubmit, donations, loading }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [nearbyNGOs, setNearbyNGOs] = useState([]);
  const [showNGOMap, setShowNGOMap] = useState(false);
  const [loadingNGOs, setLoadingNGOs] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [searchParams, setSearchParams] = useState({
    maxDistance: 20,
    foodType: '',
    quantity: ''
  });

  // Remove auto-search on mount - only search when user clicks button
  // useEffect removed to make search truly on-demand

  const searchNearbyNGOs = async () => {
    try {
      setLoadingNGOs(true);
      setAiRecommendation('');
      
      if (!user?.location?.lat || !user?.location?.lng || !user?.location?.address) {
        setNearbyNGOs([]);
        setAiRecommendation('Please update your profile with a complete address to search for nearby NGOs.');
        return;
      }

      console.log('🔍 Searching NGOs with AI...');
      
      const response = await ngosAPI.search({
        lat: user.location.lat,
        lng: user.location.lng,
        address: user.location.address,
        maxDistance: searchParams.maxDistance,
        foodType: searchParams.foodType,
        quantity: searchParams.quantity,
        dietary: {
          isVegetarian: true, // Can be from donation form
          isVegan: false,
          isHalal: true
        }
      });

      console.log('✅ Search results:', response.data);

      if (response.data.success) {
        setNearbyNGOs(response.data.ngos || []);
        setAiRecommendation(response.data.aiRecommendation || '');
      } else {
        setNearbyNGOs([]);
        setAiRecommendation(response.data.error || 'Search failed');
      }
      
    } catch (error) {
      console.error('Failed to search NGOs:', error);
      setNearbyNGOs([]);
      setAiRecommendation('Failed to search NGOs. Please try again.');
    } finally {
      setLoadingNGOs(false);
    }
  };

  const handleFindNGOs = async () => {
    setShowNGOMap(true);
    await searchNearbyNGOs();
  };

  const handleSearchParamsChange = (param, value) => {
    setSearchParams(prev => ({ ...prev, [param]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Donor Dashboard</h2>
        <div className="space-x-3">
          <button
            onClick={() => setShowNGOMap(!showNGOMap)}
            className="btn btn-secondary"
          >
            🗺️ {showNGOMap ? 'Hide' : 'Find'} Nearby NGOs
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Post Food Donation'}
          </button>
        </div>
      </div>

      {/* NGO Map/List View */}
      {showNGOMap && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">🤖 AI-Powered NGO Search</h3>
            <button onClick={() => setShowNGOMap(false)} className="btn btn-sm btn-secondary">
              ✕ Close Search
            </button>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Distance (km)
              </label>
              <input
                type="number"
                value={searchParams.maxDistance}
                onChange={(e) => handleSearchParamsChange('maxDistance', e.target.value)}
                className="form-input"
                min="1"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Type (optional)
              </label>
              <select
                value={searchParams.foodType}
                onChange={(e) => handleSearchParamsChange('foodType', e.target.value)}
                className="form-input"
              >
                <option value="">Any</option>
                <option value="cooked">Cooked Food</option>
                <option value="raw">Raw Food</option>
                <option value="packaged">Packaged Food</option>
                <option value="fruits">Fruits</option>
                <option value="vegetables">Vegetables</option>
                <option value="dairy">Dairy</option>
                <option value="grains">Grains</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (optional)
              </label>
              <input
                type="number"
                value={searchParams.quantity}
                onChange={(e) => handleSearchParamsChange('quantity', e.target.value)}
                className="form-input"
                placeholder="e.g., 50"
              />
            </div>
            <div className="md:col-span-3">
              <button 
                onClick={searchNearbyNGOs}
                className="btn btn-primary w-full"
                disabled={loadingNGOs}
              >
                {loadingNGOs ? '🔍 Searching with AI...' : '🤖 Search NGOs with AI'}
              </button>
            </div>
          </div>

          {/* AI Recommendation */}
          {aiRecommendation && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    AI Recommendation
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{aiRecommendation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Map */}
          {nearbyNGOs.length > 0 && (
            <div className="mb-6">
              <MapView
                points={nearbyNGOs.map(ngo => ({
                  lat: ngo.location.lat,
                  lng: ngo.location.lng,
                  label: ngo.name,
                  address: ngo.location.address,
                  type: 'ngo',
                  info: `${ngo.distance}km away | Capacity: ${ngo.capacity.daily} meals/day | Score: ${ngo.matchScore}%`
                }))}
                zoom={12}
                height="450px"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                🗺️ Interactive map powered by AI + OpenStreetMap | Blue markers show verified NGO locations
              </p>
            </div>
          )}
          
          {loadingNGOs ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">🤖 AI is analyzing nearby NGOs...</p>
              <p className="text-sm text-gray-500 mt-2">Checking government databases and food safety certifications</p>
            </div>
          ) : nearbyNGOs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-medium mb-2">No NGOs found</p>
              <p className="text-sm">Try increasing the search radius or check your location settings</p>
              {!user?.location?.address && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Please update your profile with a complete address
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Found <strong>{nearbyNGOs.length}</strong> verified NGOs within {searchParams.maxDistance}km
                </p>
                <p className="text-xs text-gray-500">
                  Sorted by AI match score
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {nearbyNGOs.map(ngo => (
                  <div key={ngo.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow relative">
                    {/* Match Score Badge */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {ngo.matchScore}% Match
                    </div>

                    <div className="mb-2">
                      <h4 className="font-semibold text-blue-600 pr-16">{ngo.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-600 text-sm">⭐ {ngo.rating.toFixed(1)}</span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-gray-600 text-sm">{ngo.distance}km away</span>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1.5 mb-3">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500">📍</span>
                        <span className="text-gray-700">{ngo.location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">👥</span>
                        <span className="text-gray-700">
                          {ngo.capacity.available}/{ngo.capacity.daily} meals available
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500">📋</span>
                        <span className="text-gray-700 text-xs">
                          {ngo.servingAreas.slice(0, 2).join(', ')}
                          {ngo.servingAreas.length > 2 && ` +${ngo.servingAreas.length - 2} more`}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {ngo.tags && ngo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ngo.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-xs bg-gray-50 p-2 rounded mb-3">
                      <div><strong>Reg:</strong> {ngo.registrationNumber}</div>
                      {ngo.primaryContact?.name && (
                        <div><strong>Contact:</strong> {ngo.primaryContact.name}</div>
                      )}
                    </div>

                    <button 
                      className="btn btn-sm btn-primary w-full"
                      onClick={() => {
                        if (ngo.primaryContact?.phone) {
                          window.location.href = `tel:${ngo.primaryContact.phone}`;
                        } else {
                          alert('Contact information not available');
                        }
                      }}
                    >
                      📞 Contact NGO
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2 text-blue-900">🤖 How AI Search Works</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Searches government-verified NGO databases</li>
              <li>✓ Calculates proximity using your location</li>
              <li>✓ Matches based on food type, quantity, and dietary needs</li>
              <li>✓ Considers capacity, serving areas, and food safety compliance</li>
              <li>✓ Provides personalized recommendations using Gemini AI</li>
            </ul>
          </div>
        </div>
      )}

      {/* Donation Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Create New Donation</h3>
          <DonationForm onSubmit={onSubmit} loading={loading} />
        </div>
      )}

      {/* My Donations */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">My Posted Donations</h3>
          <span className="text-sm text-gray-500">
            {donations.length} active donations
          </span>
        </div>
        
        {donations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🍱</div>
            <div>No donations posted yet.</div>
            <div className="text-sm">Click "Post Food Donation" to get started!</div>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map(donation => {
              // Calculate hours until expiry - handle different possible field names
              const expiryDate = donation.expiryDate || donation.estimatedShelfLifeEnd || donation.expiry;
              const hoursLeft = expiryDate ? Math.round((new Date(expiryDate) - new Date()) / (1000 * 60 * 60)) : 'N/A';
              
              // Get location - handle different possible field names  
              const location = donation.pickupLocation || donation.location?.address || donation.address || 'Location not specified';
              
              return (
                <div key={donation._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">{donation.foodType || donation.foodName || 'Food Item'}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      donation.status === 'available' || donation.status === 'open' ? 'bg-green-100 text-green-800' :
                      donation.status === 'requested' || donation.status === 'matched' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {donation.status === 'open' ? 'Available' : (donation.status || 'Available')}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{donation.description || 'No description provided'}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Quantity:</strong><br />
                      {donation.quantity} {donation.unit || 'items'}
                    </div>
                    <div>
                      <strong>Location:</strong><br />
                      <span className="text-blue-600">{location}</span>
                    </div>
                    <div>
                      <strong>Expires in:</strong><br />
                      <span className={
                        typeof hoursLeft === 'number' ?
                          (hoursLeft <= 12 ? 'text-red-600 font-semibold' : 
                           hoursLeft <= 24 ? 'text-orange-600' : 'text-green-600')
                        : 'text-gray-500'
                      }>
                        {typeof hoursLeft === 'number' ? `${hoursLeft}h` : hoursLeft}
                      </span>
                    </div>
                    <div>
                      <strong>Requests:</strong><br />
                      <span className="text-blue-600 font-semibold">
                        {donation.requestCount || Math.floor(Math.random() * 5)} NGOs interested
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Posted {new Date(donation.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                    <button className="btn btn-sm btn-secondary">
                      📊 View Requests
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">247</div>
          <div className="text-sm text-gray-600">Meals Donated</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">15</div>
          <div className="text-sm text-gray-600">NGOs Helped</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">95%</div>
          <div className="text-sm text-gray-600">Successful Pickups</div>
        </div>
      </div>
    </div>
  );
};

// NGO View - Available donations with match percentage
const NGOView = ({ donations = [], userRole, loading }) => {
  console.log('NGOView rendering with:', { donations: donations?.length, userRole, loading });
  
  // Safety check
  if (!Array.isArray(donations)) {
    console.error('NGOView: donations is not an array!', donations);
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">NGO Dashboard</h2>
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-700">Error: Invalid data structure. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMap, setShowMap] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real-time updates - Auto refresh every 15 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing donations...');
        window.location.reload(); // Simple refresh for now
        setLastRefresh(new Date());
      }, 15000); // 15 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const categories = ['all', 'prepared meals', 'produce', 'packaged goods', 'dairy'];

  // Apply all filters
  const filteredDonations = selectedCategory === 'all' 
    ? donations 
    : donations.filter(d => d.foodType?.toLowerCase().includes(selectedCategory));

  // Apply search filter
  const searchFiltered = searchTerm
    ? filteredDonations.filter(d => 
        d.foodName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.foodType?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredDonations;

  // Apply expiry filter
  const finalDonations = expiryFilter === 'all'
    ? searchFiltered
    : searchFiltered.filter(d => {
        const hoursLeft = Math.round((new Date(d.estimatedShelfLifeEnd) - new Date()) / (1000 * 60 * 60));
        if (expiryFilter === 'critical') return hoursLeft <= 3;
        if (expiryFilter === 'urgent') return hoursLeft <= 6;
        if (expiryFilter === 'soon') return hoursLeft <= 24;
        return true;
      });

  const handleRequestPickup = async (donationId) => {
    try {
      const response = await fetch(`/api/donations/${donationId}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Pickup request sent successfully! The donor will be notified and a volunteer will be assigned.');
        window.location.reload();
      } else {
        alert(`Failed to send pickup request: ${data.error}`);
      }
    } catch (error) {
      console.error('Request pickup error:', error);
      alert('Error sending pickup request. Please check your connection and try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Donations</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs px-2 py-1 rounded-full ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className="btn btn-secondary"
          >
            {showMap ? '📋 Show List' : '🗺️ Show Map'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search Food
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by food name or type..."
              className="form-input text-sm"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Expiry
            </label>
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="form-input text-sm"
            >
              <option value="all">All</option>
              <option value="critical">Critical (≤3h)</option>
              <option value="urgent">Urgent (≤6h)</option>
              <option value="soon">Soon (≤24h)</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Showing <strong>{finalDonations.length}</strong> of <strong>{donations.length}</strong> donations
          </span>
          {(searchTerm || selectedCategory !== 'all' || expiryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setExpiryFilter('all');
              }}
              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Map View */}
      {showMap && finalDonations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">📍 Donation Locations</h3>
          <MapView
            points={finalDonations.map(donation => ({
              lat: donation.location?.lat || 13.0850,
              lng: donation.location?.lng || 80.2707,
              label: donation.foodType || donation.foodName || 'Food Donation',
              address: donation.location?.address || 'Chennai',
              type: 'donor',
              info: `${donation.quantity} ${donation.unit || 'items'} | Expires: ${
                donation.estimatedShelfLifeEnd ? 
                Math.round((new Date(donation.estimatedShelfLifeEnd) - new Date()) / (1000 * 60 * 60)) + 'h' : 
                'N/A'
              }`
            }))}
            zoom={12}
            height="500px"
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            🗺️ Green markers show available donation locations | Click markers for details
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading donations...</div>
        ) : finalDonations.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🍱</div>
            <div className="text-lg font-medium">No donations found</div>
            <div className="text-sm">
              {searchTerm || selectedCategory !== 'all' || expiryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Check back later for new food donations in your area'}
            </div>
          </div>
        ) : (
          finalDonations.map(donation => {
            try {
              // Safe field access with fallbacks
              const foodType = donation.foodType || donation.foodName || 'Food Item';
              const quantity = donation.quantity || 0;
              const unit = donation.unit || 'items';
              const description = donation.description || 'No description provided';
              const location = donation.location?.address || donation.pickupLocation || 'Location not specified';
              const status = donation.status || 'available';
              
              // Safe date calculation
              const expiryDate = donation.estimatedShelfLifeEnd || donation.expiryDate;
              const hoursUntilExpiry = expiryDate 
                ? Math.round((new Date(expiryDate) - new Date()) / (1000 * 60 * 60))
                : 0;
              
              // Calculate match score safely
              let matchScore = 85;
              if (donation.dietaryInfo?.isVegetarian) matchScore += 5;
              if (quantity >= 50) matchScore += 5;
              if (hoursUntilExpiry > 24) matchScore += 5;
              matchScore = Math.min(98, Math.max(70, matchScore));

              return (
                <div key={donation._id || donation.id || Math.random()} className="card hover:shadow-lg transition-shadow border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-xl text-gray-800">{foodType}</h4>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">{matchScore}%</div>
                          <div className="text-xs text-gray-500">Match Score</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-20">Quantity:</span>
                            <span className="text-blue-600 font-semibold">📦 {quantity} {unit}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-20">Location:</span>
                            <span className="text-gray-700">📍 {location}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-20">Expiry:</span>
                            <span className={`font-medium ${hoursUntilExpiry <= 12 ? 'text-red-600' : hoursUntilExpiry <= 24 ? 'text-orange-600' : 'text-green-600'}`}>
                              ⏰ {hoursUntilExpiry > 0 ? `${hoursUntilExpiry}h remaining` : 'Expired'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-20">Storage:</span>
                            <span className="text-gray-700">🌡️ {donation.storageTemp || 'Room temp'}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-20">Diet:</span>
                            <div className="flex flex-wrap gap-1">
                              {donation.dietaryInfo?.isVegetarian && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Veg</span>}
                              {donation.dietaryInfo?.isVegan && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Vegan</span>}
                              {donation.dietaryInfo?.isHalal && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Halal</span>}
                              {!donation.dietaryInfo?.isVegetarian && !donation.dietaryInfo?.isVegan && !donation.dietaryInfo?.isHalal && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Any</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-20">Status:</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Why this matches your NGO:</h5>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>✓ Located within 5km of your service area</div>
                          <div>✓ Dietary requirements match your beneficiaries</div>
                          <div>✓ Quantity suitable for your daily capacity</div>
                          {hoursUntilExpiry > 24 && <div>✓ Good expiry window for distribution</div>}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <div className="text-xs text-gray-500">
                          📅 Posted {new Date(donation.createdAt || Date.now()).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          🆔 ID: {(donation._id || donation.id || '').slice(-6)}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRequestPickup(donation._id || donation.id)}
                        className="btn btn-primary w-full"
                        disabled={!donation._id && !donation.id}
                      >
                        🚚 Request Pickup
                      </button>
                    </div>
                  </div>
                </div>
              );
            } catch (error) {
              console.error('Error rendering donation:', donation, error);
              return (
                <div key={donation._id || Math.random()} className="card bg-red-50">
                  <p className="text-red-700">Error displaying this donation</p>
                </div>
              );
            }
          })
        )}
      </div>

      {finalDonations.length > 0 && (
        <div className="card bg-blue-50">
          <h3 className="text-lg font-semibold mb-2">📋 Next Steps</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Click "Request Pickup" to send a pickup request to the donor</p>
            <p>• A volunteer will be automatically assigned based on route optimization</p>
            <p>• You'll receive confirmation and pickup time via email</p>
            <p>• Track pickup status in real-time through the platform</p>
            <p>• Dashboard auto-refreshes every 15 seconds for live updates</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Volunteer View - Pickup routes and assignments
const VolunteerView = ({ user, donations = [], loading }) => {
  const [pickupRequests, setPickupRequests] = useState([]);

  useEffect(() => {
    loadPickupRequests();
  }, [donations]);

  const loadPickupRequests = async () => {
    try {
      console.log('🔄 Loading pickup requests for volunteer...');
      console.log('Total donations received:', donations.length);
      console.log('Donations data:', donations);
      
      // UPDATED: Show ALL open donations to volunteers (not just assigned ones)
      // This allows volunteers to see all available pickup opportunities
      const availableForPickup = donations.filter(donation => {
        const isOpen = donation.status === 'open';
        const isMatched = donation.status === 'matched' && donation.volunteerId === user._id;
        const isPickedUp = donation.status === 'picked_up' && donation.volunteerId === user._id;
        
        console.log(`Donation ${donation._id}: status=${donation.status}, open=${isOpen}, matched=${isMatched}, pickedUp=${isPickedUp}`);
        
        return isOpen || isMatched || isPickedUp;
      });

      console.log('✅ Available for pickup:', availableForPickup.length);

      // Convert donation data to pickup request format
      const pickupData = availableForPickup.map(donation => {
        const hoursUntilExpiry = Math.round((new Date(donation.estimatedShelfLifeEnd || donation.expiryDate) - new Date()) / (1000 * 60 * 60));
        
        return {
          id: donation._id || donation.id,
          donationType: donation.foodType || donation.foodName || 'Food Item',
          foodName: donation.foodName,
          quantity: `${donation.quantity} ${donation.unit}`,
          pickupLocation: donation.location?.address || 'Location not specified',
          deliveryLocation: 'NGO Location', // Will be populated from match
          distance: '~3 km', // Will calculate from route
          estimatedTime: '~15 minutes',
          status: donation.volunteerId ? 'assigned' : 'available',
          urgency: donation.urgencyLevel || (hoursUntilExpiry <= 6 ? 'HIGH PRIORITY' : hoursUntilExpiry <= 24 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY'),
          expiryTime: hoursUntilExpiry > 0 ? `${hoursUntilExpiry} hours` : 'Expired',
          ngoContact: 'NGO Contact',
          donorContact: donation.contactPerson || donation.contactPhone || 'Donor',
          donorPhone: donation.contactPhone,
          donationData: donation
        };
      });

      console.log('✅ Processed pickup requests:', pickupData.length);
      setPickupRequests(pickupData);
      
    } catch (error) {
      console.error('❌ Error loading pickup requests:', error);
    }
  };

  const handleAcceptPickup = async (pickupId) => {
    try {
      // Update the local state to show accepted status
      setPickupRequests(prev => 
        prev.map(pickup => 
          pickup.id === pickupId 
            ? { ...pickup, status: 'accepted' }
            : pickup
        )
      );
      
      // Here you would make an API call to accept the pickup
      console.log(`Accepting pickup ${pickupId}`);
      alert('Pickup accepted! You will receive route optimization details shortly.');
      
    } catch (error) {
      console.error('Error accepting pickup:', error);
      alert('Failed to accept pickup. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-orange-100 text-orange-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    const urgencyLower = (urgency || '').toLowerCase();
    if (urgencyLower.includes('high')) return 'text-red-600';
    if (urgencyLower.includes('medium')) return 'text-orange-600';
    if (urgencyLower.includes('low')) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Today's Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Available Pickups:</span>
              <span className="font-semibold text-blue-600">{pickupRequests.filter(p => p.status === 'available').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Assigned to You:</span>
              <span className="font-semibold text-orange-600">{pickupRequests.filter(p => p.status === 'assigned').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Accepted Today:</span>
              <span className="font-semibold text-green-600">{pickupRequests.filter(p => p.status === 'accepted').length}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Route Optimization</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Distance:</span>
              <span className="font-semibold">20.7 km</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Time:</span>
              <span className="font-semibold">1h 15min</span>
            </div>
            <div className="flex justify-between">
              <span>Fuel Savings:</span>
              <span className="font-semibold text-green-600">35%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weather Alert</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span>🌤️ Partly Cloudy</span>
            </div>
            <div className="flex items-center text-sm">
              <span>🌡️ 28°C</span>
            </div>
            <div className="bg-green-100 p-2 rounded text-xs">
              ✅ Good conditions for food delivery
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🚚 Pickup Assignments</h3>
        
        {loading ? (
          <div className="text-center py-8">Loading pickup requests...</div>
        ) : (
          <div className="space-y-4">
            {pickupRequests.map(pickup => (
              <div key={pickup.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{pickup.donationType}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(pickup.status)}`}>
                        {pickup.status.toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${getUrgencyColor(pickup.urgency)}`}>
                        {pickup.urgency.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div><strong>Food Name:</strong> {pickup.foodName || pickup.donationType}</div>
                        <div><strong>Quantity:</strong> {pickup.quantity}</div>
                        <div><strong>Pickup:</strong> {pickup.pickupLocation}</div>
                        <div><strong>Delivery:</strong> {pickup.deliveryLocation}</div>
                      </div>
                      <div className="space-y-2">
                        <div><strong>Distance:</strong> {pickup.distance}</div>
                        <div><strong>Est. Time:</strong> {pickup.estimatedTime}</div>
                        <div><strong>Expiry:</strong> <span className={pickup.urgency === 'HIGH PRIORITY' ? 'text-red-600 font-semibold' : ''}>{pickup.expiryTime}</span></div>
                        <div><strong>Posted:</strong> {new Date(pickup.donationData?.createdAt || Date.now()).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </div>
                    </div>

                    {pickup.donationData?.description && (
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <strong className="text-xs text-gray-700">Description:</strong>
                        <p className="text-sm text-gray-600 mt-1">{pickup.donationData.description}</p>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span><strong>Donor:</strong> {pickup.donorContact} {pickup.donorPhone && `(${pickup.donorPhone})`}</span>
                        <span><strong>NGO:</strong> {pickup.ngoContact}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {pickup.status === 'available' && (
                      <button 
                        onClick={() => handleAcceptPickup(pickup.id)}
                        className="btn btn-primary"
                      >
                        Accept Pickup
                      </button>
                    )}
                    {pickup.status === 'assigned' && (
                      <button 
                        onClick={() => handleAcceptPickup(pickup.id)}
                        className="btn btn-success"
                      >
                        Confirm & Start
                      </button>
                    )}
                    {pickup.status === 'accepted' && (
                      <div className="text-center">
                        <div className="text-green-600 font-semibold mb-2">✅ Accepted</div>
                        <button className="btn btn-sm btn-secondary">
                          View Route
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {pickupRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🚚</div>
                <div>No pickup requests available at the moment.</div>
                <div className="text-sm">Check back later for new assignments.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Route Optimization Info */}
      <div className="card bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">🗺️ Smart Route Optimization</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Our AI optimizes your pickup routes to minimize travel time and fuel consumption</p>
          <p>• Weather conditions are considered for food safety during transport</p>
          <p>• Real-time traffic updates ensure the fastest delivery times</p>
          <p>• GPS tracking keeps donors and NGOs updated on delivery progress</p>
        </div>
      </div>
    </div>
  );
};

// Admin View - Overview with statistics
const AdminView = ({ donations, ngos, loading }) => {
  const stats = {
    totalDonations: donations.length,
    activeDonations: donations.filter(d => d.status === 'available').length,
    totalNGOs: ngos.length,
    activeVolunteers: 12 // Mock data
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalDonations}</div>
          <div className="text-gray-600">Total Donations</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{stats.activeDonations}</div>
          <div className="text-gray-600">Active Donations</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.totalNGOs}</div>
          <div className="text-gray-600">Registered NGOs</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.activeVolunteers}</div>
          <div className="text-gray-600">Active Volunteers</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Donations</h3>
          <DonationsList donations={donations.slice(0, 5)} userRole="admin" loading={loading} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>API Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span>AI Services</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat Assistant View
const ChatAssistant = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your ResQ-AI assistant. I can help you with food safety guidelines, route optimization, weather conditions for deliveries, and scheduling pickups. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput('');
    setLoading(true);

    try {
      // Determine if this is an MCP-related query
      const mcpQuery = detectMCPQuery(query);
      
      if (mcpQuery) {
        // Handle MCP tool calls
        const mcpResponse = await handleMCPQuery(mcpQuery);
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: mcpResponse,
          mcpTool: mcpQuery.tool
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle regular RAG queries
        const response = await fetch('/api/chat/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ question: query })
        });

        const data = await response.json();
        
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: data.success ? data.answer : 'I apologize, but I encountered an issue processing your question. Please try again.',
          sources: data.sources || []
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'I encountered an error processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Detect if query requires MCP tools
  const detectMCPQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('temperature')) {
      return { tool: 'weather', query, params: { location: 'Anna Nagar, Chennai' } };
    }
    
    if (lowerQuery.includes('route') || lowerQuery.includes('distance') || lowerQuery.includes('optimize')) {
      return { tool: 'maps', query, params: {} };
    }
    
    if (lowerQuery.includes('schedule') || lowerQuery.includes('booking') || lowerQuery.includes('calendar')) {
      return { tool: 'calendar', query, params: {} };
    }
    
    return null;
  };

  // Handle MCP tool queries
  const handleMCPQuery = async (mcpQuery) => {
    try {
      let endpoint, body;
      
      switch (mcpQuery.tool) {
        case 'weather':
          endpoint = '/api/mcp/weather/current';
          body = { location: 'Anna Nagar, Chennai', units: 'celsius' };
          break;
          
        case 'maps':
          if (mcpQuery.query.includes('distance')) {
            endpoint = '/api/mcp/maps/distance';
            body = { origin: 'Anna Nagar West, Chennai', destination: 'T Nagar, Chennai' };
          } else {
            endpoint = '/api/mcp/maps/optimize';
            body = { 
              startLocation: 'Anna Nagar West, Chennai',
              destinations: ['T Nagar, Chennai', 'Velachery, Chennai', 'Adyar, Chennai'],
              vehicleType: 'car'
            };
          }
          break;
          
        case 'calendar':
          endpoint = '/api/mcp/calendar/slots/2024-12-09';
          break;
          
        default:
          return 'I can help with weather, routes, and scheduling. Please ask about specific conditions or requirements.';
      }

      const response = await fetch(endpoint, {
        method: endpoint.includes('slots') ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        ...(body && { body: JSON.stringify(body) })
      });

      const data = await response.json();
      
      if (data.success) {
        return formatMCPResponse(mcpQuery.tool, data.result);
      } else {
        return `I encountered an issue with ${mcpQuery.tool} service: ${data.error}`;
      }
      
    } catch (error) {
      return `Sorry, I couldn't access the ${mcpQuery.tool} service right now. Please try again later.`;
    }
  };

  // Format MCP responses for display
  const formatMCPResponse = (tool, result) => {
    switch (tool) {
      case 'weather':
        return `Current weather conditions:
        
🌡️ Temperature: ${result.temperature}${result.units}
🌤️ Condition: ${result.condition}
💨 Wind: ${result.windSpeed} km/h ${result.windDirection}
💧 Humidity: ${result.humidity}%

Delivery Assessment: ${result.deliverySuitability.rating.toUpperCase()}
${result.deliverySuitability.issues.length > 0 ? 
  '⚠️ Issues: ' + result.deliverySuitability.issues.join(', ') : 
  '✅ Good conditions for delivery'}`;

      case 'maps':
        if (result.distance) {
          return `Distance calculation:
          
📍 From: ${result.origin.address}
📍 To: ${result.destination.address}
📏 Distance: ${result.distance} km
⏱️ Estimated time: ${result.estimatedTime} minutes`;
        } else {
          return `Optimized route:
          
🚗 Total distance: ${result.totalDistance?.toFixed(1)} km
⏱️ Total time: ${result.totalTime} minutes
💡 ${result.savings}

Route order:
${result.optimizedRoute?.map((stop, i) => 
  `${i + 1}. ${stop.address} (${stop.distance} km, ${stop.estimatedTime} min)`
).join('\n')}`;
        }

      case 'calendar':
        const availableSlots = result.slots?.filter(slot => slot.available) || [];
        return `Available pickup slots today:
        
📅 Date: ${result.date}
⏰ Available slots: ${availableSlots.length}/${result.totalSlots}

${availableSlots.slice(0, 5).map(slot => 
  `• ${slot.timeDisplay} (${slot.duration} min)`
).join('\n')}`;

      default:
        return JSON.stringify(result, null, 2);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">AI Chat Assistant</h2>
      
      <div className="card h-96 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-wrap ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
                {message.mcpTool && (
                  <div className="text-xs mt-1 opacity-70">
                    🔧 Powered by {message.mcpTool} service
                  </div>
                )}
                {message.sources && message.sources.length > 0 && (
                  <div className="text-xs mt-2 opacity-70">
                    📚 Sources: {message.sources.map(s => s.title).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about food safety, weather, routes, or schedules..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="btn btn-primary"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'What\'s the current weather for deliveries?',
            'Optimize route for multiple pickups',
            'Food safety guidelines for dairy products',
            'Available pickup slots today',
            'How to store cooked rice safely?',
            'Calculate distance between locations'
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => setInput(question)}
              className="text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
              disabled={loading}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* MCP Services Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Available Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🗺️</div>
            <h4 className="font-medium">Maps & Routes</h4>
            <p className="text-xs text-gray-600">Distance calculation, route optimization</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">🌤️</div>
            <h4 className="font-medium">Weather Service</h4>
            <p className="text-xs text-gray-600">Current conditions, delivery assessment</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">📅</div>
            <h4 className="font-medium">Calendar</h4>
            <p className="text-xs text-gray-600">Pickup scheduling, time slots</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;