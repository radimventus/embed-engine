import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { ClientOutputSnapshot, ClientOutputTrigger } from '@embed-engine/document-runtime';
import { platformApiStatePath } from './platformApiConfig';

export type ClientOutputDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
export type DurableClientOutput = {
  readonly documentId: string; readonly createdAt: string; readonly projectId: string; readonly houseId: string;
  readonly knowledgeVersion: string; readonly recipient: string; readonly trigger: ClientOutputTrigger;
  readonly auditLeadId: string | null; readonly snapshot: ClientOutputSnapshot; readonly pdfBase64: string;
  readonly deliveryStatus: ClientOutputDeliveryStatus; readonly deliveryProviderId: string | null; readonly deliveryError: string | null;
};
export interface ClientOutputRepository { create(record: DurableClientOutput): Promise<DurableClientOutput>; updateDelivery(documentId: string, delivery: Pick<DurableClientOutput,'deliveryStatus'|'deliveryProviderId'|'deliveryError'>): Promise<DurableClientOutput>; get(documentId: string): Promise<DurableClientOutput | null>; }
type State={readonly documents:readonly DurableClientOutput[]};
export class FileClientOutputRepository implements ClientOutputRepository {
  private mutation:Promise<void>=Promise.resolve(); constructor(private readonly statePath=platformApiStatePath('client-outputs.json')){}
  async create(record:DurableClientOutput){return this.exclusively(async()=>{const state=await this.read();await this.write({documents:[...state.documents,record]});return record;});}
  async updateDelivery(documentId:string,delivery:Pick<DurableClientOutput,'deliveryStatus'|'deliveryProviderId'|'deliveryError'>){return this.exclusively(async()=>{const state=await this.read();const index=state.documents.findIndex(item=>item.documentId===documentId);if(index<0)throw new Error('Client output not found.');const documents=[...state.documents];documents[index]={...documents[index]!,...delivery};await this.write({documents});return documents[index]!;});}
  async get(documentId:string){return (await this.read()).documents.find(item=>item.documentId===documentId)??null;}
  private async read():Promise<State>{try{const parsed=JSON.parse(await readFile(this.statePath,'utf8')) as State;return{documents:Array.isArray(parsed.documents)?parsed.documents:[]};}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return{documents:[]};throw error;}}
  private async write(state:State){await mkdir(dirname(this.statePath),{recursive:true});const temporary=`${this.statePath}.tmp`;await writeFile(temporary,JSON.stringify(state),{mode:0o600});await rename(temporary,this.statePath);}
  private async exclusively<T>(fn:()=>Promise<T>){let release=()=>{};const previous=this.mutation;this.mutation=new Promise<void>(resolve=>{release=resolve;});await previous;try{return await fn();}finally{release();}}
}
