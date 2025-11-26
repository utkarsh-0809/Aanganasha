import { useState, useEffect, useCallback } from 'react';
import { api } from '../axios.config';
import { useAuth } from '../context/UserContext';
import { 
  MapPin, 
  Users, 
  Phone, 
  Heart,
  Filter,
  Search,
  Plus,
  Minus,
  UserCheck,
  Building,
  Activity
} from 'lucide-react';

const DoctorsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [allAanganwadis, setAllAanganwadis] = useState([]);
  const [volunteerAanganwadis, setVolunteerAanganwadis] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAanganwadi, setSelectedAanganwadi] = useState(null);
  const [children, setChildren] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch doctor's dashboard data (volunteer aanganwadis)
      const dashboardResponse = await api.get('/doctor/dashboard');
      setVolunteerAanganwadis(dashboardResponse.data.volunteerAanganwadis || []);
      
      // Fetch all available aanganwadis
      const params = cityFilter ? { city: cityFilter } : {};
      const allResponse = await api.get('/doctor/aanganwadis/all', { params });
      setAllAanganwadis(allResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [cityFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleVolunteer = async (aanganwadiCode) => {
    try {
      await api.post('/doctor/volunteer', { aanganwadiCode });
      await fetchDashboardData(); // Refresh data
      alert('Successfully volunteered for this Aanganwadi!');
    } catch (error) {
      console.error('Error volunteering:', error);
      alert(error.response?.data?.message || 'Failed to volunteer');
    }
  };

  const handleStopVolunteering = async (aanganwadiCode) => {
    try {
      await api.post('/doctor/stop-volunteer', { aanganwadiCode });
      await fetchDashboardData(); // Refresh data
      alert('Stopped volunteering for this Aanganwadi');
    } catch (error) {
      console.error('Error stopping volunteer:', error);
      alert('Failed to stop volunteering');
    }
  };

  const fetchChildren = async (aanganwadiCode) => {
    try {
      const response = await api.get(`/doctor/aanganwadi/${aanganwadiCode}/children`);
      setChildren(response.data || []);
      setSelectedAanganwadi(aanganwadiCode);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const filteredAanganwadis = allAanganwadis.filter(aanganwadi => {
    const matchesSearch = aanganwadi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aanganwadi.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !cityFilter || aanganwadi.address.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesSearch && matchesCity;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">Welcome back, Dr. {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <Heart className="h-4 w-4 inline mr-1" />
                {volunteerAanganwadis.length} Volunteer Centers
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'browse', label: 'Browse Aanganwadis', icon: Search },
                { id: 'volunteer', label: 'My Volunteer Centers', icon: UserCheck },
                { id: 'children', label: 'Children Management', icon: Users }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`${
                    activeTab === id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Browse Aanganwadis Tab */}
            {activeTab === 'browse' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <div className="relative">
                      <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Filter by city..."
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAanganwadis.map((aanganwadi) => {
                    const isVolunteering = volunteerAanganwadis.some(v => v.code === aanganwadi.code);
                    return (
                      <div key={aanganwadi._id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{aanganwadi.name}</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {aanganwadi.code}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {aanganwadi.address}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              {aanganwadi.childCount} children
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="h-4 w-4 mr-2" />
                              {aanganwadi.staffCount}/{aanganwadi.staffCapacity} staff
                            </div>
                          </div>

                          {aanganwadi.coordinator && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">Coordinator</h4>
                              <p className="text-sm text-gray-600">{aanganwadi.coordinator.name}</p>
                              {aanganwadi.coordinator.phone && (
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {aanganwadi.coordinator.phone}
                                </p>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => isVolunteering ? handleStopVolunteering(aanganwadi.code) : handleVolunteer(aanganwadi.code)}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                              isVolunteering
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {isVolunteering ? (
                              <>
                                <Minus className="h-4 w-4 inline mr-2" />
                                Stop Volunteering
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 inline mr-2" />
                                Volunteer
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredAanganwadis.length === 0 && (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No Aanganwadis found matching your criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* My Volunteer Centers Tab */}
            {activeTab === 'volunteer' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">My Volunteer Centers ({volunteerAanganwadis.length})</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {volunteerAanganwadis.map((aanganwadi) => (
                    <div key={aanganwadi._id} className="bg-white rounded-lg border shadow-sm">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{aanganwadi.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{aanganwadi.address}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Children:</span>
                            <span className="font-medium">{aanganwadi.childCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Staff:</span>
                            <span className="font-medium">{aanganwadi.staffCount}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchChildren(aanganwadi.code)}
                            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Activity className="h-4 w-4 inline mr-2" />
                            View Children
                          </button>
                          <button
                            onClick={() => handleStopVolunteering(aanganwadi.code)}
                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {volunteerAanganwadis.length === 0 && (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">You&apos;re not volunteering for any Aanganwadis yet</p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Browse Aanganwadis
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Children Management Tab */}
            {activeTab === 'children' && (
              <div className="space-y-6">
                {selectedAanganwadi ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Children in {selectedAanganwadi}</h2>
                      <button
                        onClick={() => setSelectedAanganwadi(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Back to Centers
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Records</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {children.map((child) => {
                            const age = new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear();
                            return (
                              <tr key={child._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{child.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {age} years
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {child.gender}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {child.healthRecords?.length || 0} records
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => window.open(`/child/${child._id}`, '_blank')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    View Profile
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select an Aanganwadi from &quot;My Volunteer Centers&quot; to view children</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsDashboard;