'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/app/globals.css';

interface DateIdea {
  name: string;
  'date location': string;
  budget: string;
  activities?: {
    activity: string;
    description: string;
  }[];
  cost_breakdown?: {
    item: string;
    description: string;
  }[];
  tips?: {
    tip: string;
  }[];
  photos?: string[];
  website?: string;
}

interface UserIdeasProps {
  userId: string;
}

export default function Conversations({ userId }: UserIdeasProps) {
  const [selectedIdea, setSelectedIdea] = useState<DateIdea | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState('calc(100vh - 10%)');

  useEffect(() => {
    const fetchUserIdeas = async () => {
      try {
        const response = await fetch(`/api/dateIdeasDB?userId=${userId}`);
        const data = await response.json();
        if (data.length > 0) {
          setDateIdeas(data[0].dateIdeas);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user ideas:', error);
        setError('Failed to fetch user ideas');
        setLoading(false);
      }
    };

    fetchUserIdeas();
  }, [userId]);

  useEffect(() => {
    const handleResize = () => {
      setDropdownHeight(`calc(100vh - 10%)`);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelect = (idea: DateIdea) => {
    console.log('Selected idea:', idea);
    setSelectedIdea(idea);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="absolute top-0 left-0 m-4">
      <div className="relative w-full max-w-xs">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full bg-white border text-black px-4 py-2 border border-black rounded shadow-sm flex justify-between items-center"
        >
          Select an item
          <svg
            className={`w-5 h-5 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="absolute w-full rounded-b shadow-lg z-10 bg-white" style={{ height: dropdownHeight }}>
            <ul className="bg-white border border-black rounded-b p-1 overflow-y-auto h-full">
              {dateIdeas.map((idea, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(idea)}
                  className="px-4 py-2 mb-2 text-black hover:bg-gray-200 cursor-pointer flex flex-col items-center text-center"
                >
                  <span className="font-semibold">{idea.name}</span>
                  <span className="text-sm text-gray-600">{idea['date location']}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isModalOpen && selectedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative bg-white rounded-lg overflow-hidden shadow-lg w-full h-full max-w-[calc(100%-100px)] max-h-[calc(100%-80px)] p-4 flex flex-col">
            <button
              className="absolute bottom-4 left-4 px-4 py-2 bg-black text-white rounded-md z-10"
              onClick={closeModal}
            >
              Close
            </button>

            <div className="flex flex-row h-full">
              <div className="w-1/3 p-4 flex items-center justify-center h-full">
                <div className="w-full max-w-md border border-black">
                  <Slider {...sliderSettings}>
                    {selectedIdea.photos && selectedIdea.photos.length > 0 ? selectedIdea.photos.map((image, index) => (
                      <div key={index} className="h-[30rem]">
                        <div className="relative h-full">
                          <a href={selectedIdea.website} target="_blank" rel="noopener noreferrer">
                            <Image
                              className="object-cover rounded-lg"
                              src={image}
                              layout="fill"
                              objectFit="cover"
                              alt={`${selectedIdea.name} image ${index + 1}`}
                            />
                          </a>
                        </div>
                      </div>
                    )) : (
                      <div className="h-40">
                        <div className="relative h-full">
                          <Image
                            className="object-cover rounded-lg"
                            src="/static/mystery-card.png"
                            layout="fill"
                            objectFit="cover"
                            alt={`${selectedIdea.name} image 1`}
                          />
                        </div>
                      </div>
                    )}
                  </Slider>
                </div>
              </div>

              <div className="w-2/3 p-6 text-black overflow-y-auto">
                <h2 className="text-3xl font-bold mb-4">{selectedIdea.name}</h2>
                <p className="text-lg mb-2"><strong>Location:</strong> <span className="font-normal">{selectedIdea['date location']}</span></p>
                <p className="text-lg mb-2"><strong>Budget:</strong> <span className="font-normal">{selectedIdea.budget}</span></p>

                <div className="text-lg mb-5">
                  <strong>Activities:</strong>
                  {selectedIdea.activities && selectedIdea.activities.length ? selectedIdea.activities.map((activity, index) => (
                    <div key={index} className="mt-2">
                      <p className="text-lg font-semibold">{activity.activity}:</p>
                      <p className="text-lg font-normal">{activity.description}</p>
                    </div>
                  )) : <p>No activities available</p>}
                </div>

                <div className="text-lg mb-5">
                  <strong>Cost Breakdown:</strong>
                  {selectedIdea.cost_breakdown && selectedIdea.cost_breakdown.length ? selectedIdea.cost_breakdown.map((cost, index) => (
                    <div key={index} className="mt-2">
                      <p className="text-lg font-semibold">{cost.item}:</p>
                      <p className="text-lg font-normal">{cost.description}</p>
                    </div>
                  )) : <p>No cost breakdown available</p>}
                </div>

                <div className="text-lg mb-2">
                  <strong>Tips:</strong>
                  {selectedIdea.tips && selectedIdea.tips.length ? selectedIdea.tips.map((tip, index) => (
                    <div key={index} className="mt-2">
                      <p className="text-lg font-normal">{tip.tip}</p>
                    </div>
                  )) : <p>No tips available</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
