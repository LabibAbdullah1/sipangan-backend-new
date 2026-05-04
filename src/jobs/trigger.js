import { runStatusUpdateJob } from './statusJob.js';

console.log('Manually triggering status update job...');
runStatusUpdateJob().then(() => {
    console.log('Status update completed. Redis is now populated.');
    process.exit(0);
}).catch(err => {
    console.error('Failed to update status:', err);
    process.exit(1);
});
