'use server';

import { databases, storage } from '@/app/lib/appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.DATABASE_ID;
const ASSIGNMENTS_COLLECTION
