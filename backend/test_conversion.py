import asyncio
import sys
import os

sys.path.append(os.path.dirname(__file__))

from app.services.queue_service import QueueService

async def main():
    item = QueueService.add_to_queue('https://www.youtube.com/watch?v=jNQXAC9IVRw', 'mp4-720', 'Me at the zoo')
    await QueueService.start_conversion()
    print('Status:', item.status)

if __name__ == '__main__':
    asyncio.run(main())
