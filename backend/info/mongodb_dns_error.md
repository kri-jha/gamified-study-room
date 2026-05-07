# MongoDB DNS `querySrv` Error

## Error
When trying to connect to a MongoDB Atlas cluster using a `mongodb+srv://` connection string, the Node.js application threw the following error:
```
MongoDB connection error: Error: querySrv ECONNREFUSED _mongodb._tcp.krishnadev.thpfu9z.mongodb.net
```

## Cause
The special `mongodb+srv://` protocol requires Node.js to perform an "SRV" DNS lookup to automatically resolve the actual database node addresses. In some local environments, network restrictions (such as a local firewall, an ISP block, or a custom DNS configuration) block Node.js from successfully completing this SRV lookup, resulting in `ECONNREFUSED`.

## Solution
To bypass the blocked SRV lookup, we can manually resolve the SRV record into its standard connection string format (`mongodb://`) and connect directly to the replica set nodes. 

Instead of this:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@krishnadev.thpfu9z.mongodb.net/
```

We change the connection string to directly point to the underlying shard nodes and specify the replica set:
```env
MONGODB_URI=mongodb://<username>:<password>@ac-niuaq6b-shard-00-00.thpfu9z.mongodb.net:27017,ac-niuaq6b-shard-00-01.thpfu9z.mongodb.net:27017,ac-niuaq6b-shard-00-02.thpfu9z.mongodb.net:27017/?ssl=true&replicaSet=atlas-k8kg9c-shard-0&authSource=admin&retryWrites=true&w=majority
```

This prevents Node.js from needing to perform the blocked DNS lookup and allows it to connect to the database directly.
