import React from 'react';
import { format } from 'date-fns';

const Notifications = ({ notifications }) => {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No new notifications
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((notif) => (
        <div 
          key={notif.id} 
          className={`p-4 border-b hover:bg-gray-50 transition-colors ${
            notif.status === 'UNREAD' ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm text-gray-900">{notif.subject}</h4>
            <span className="text-xs text-gray-500">
              {notif.createdAt ? format(new Date(notif.createdAt), 'MMM dd, p') : ''}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
          <div className="mt-2 flex gap-2">
             <span className="text-[10px] px-2 py-0.5 bg-gray-200 rounded-full text-gray-700">
               {notif.type}
             </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;