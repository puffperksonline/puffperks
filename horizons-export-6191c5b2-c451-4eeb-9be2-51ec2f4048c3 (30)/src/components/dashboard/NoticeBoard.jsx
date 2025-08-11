import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient.js';
import { Megaphone, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const NoticeBoard = ({ storeId }) => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      if (!storeId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('id, title, content, created_at')
          .or(`show_to_all_stores.eq.true,target_store_ids.cs.{"${storeId}"}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notices:', error);
          setNotices([]);
        } else if (data) {
          setNotices(data);
        }
      } catch (e) {
        console.error('An unexpected error occurred fetching notices:', e);
        setNotices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, [storeId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-gray-400">
          Loading notices...
        </div>
      );
    }

    if (notices.length === 0) {
      return (
        <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full py-4">
          <Info className="w-8 h-8 mb-2" />
          <p>Notices will appear here from time to time.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {notices.map((notice, index) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            layout
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <div className="flex items-center mb-2">
              <Megaphone className="w-5 h-5 mr-2 text-yellow-400" />
              <h3 className="text-md font-semibold text-white">{notice.title}</h3>
            </div>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{notice.content}</p>
            <p className="text-xs text-gray-500 mt-3 text-right">
              Posted on {new Date(notice.created_at).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-effect rounded-xl p-6 border border-yellow-500/30">
      {renderContent()}
    </div>
  );
};

export default NoticeBoard;