import type {PartitionMap} from '@/lib';
export class ThreadSync {
  #state: PartitionMap<Promise<any>>;
}
