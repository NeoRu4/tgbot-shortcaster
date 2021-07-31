import * as sqlite3 from 'sqlite3'
import { open as openQuery } from 'sqlite'
import { DataMessage } from '../model/DataMessage'
import { User } from '../api/api'

export class SQLiteService {
    
    constructor() {
        
        this._createTables()
    }
    
    public async dbQuery() {

        const DB_PATH = './database.db'

        return openQuery({
            filename: DB_PATH,
            driver: sqlite3.Database
        })
    }
    
    private async _createTables() {

        //id, chatId, senderId, time, text
        (await this.dbQuery()).exec(
            `CREATE TABLE IF NOT EXISTS message (
                id INTEGER PRIMARY KEY,
                chatId INTEGER NOT NULL,
                senderId INTEGER NOT NULL,
                time DATETIME,
                text TEXT NOT NULL
            );`);

        //id, chatId, first_name, username
        (await this.dbQuery()).exec(
            `CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY,
                chatId INTEGER,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                username TEXT NOT NULL
            );`);
 
    }

    async getLastTextByChat(chatId: number, msgLimit: number) {
        
        const statement = (await this.dbQuery()).prepare(
            `SELECT text, senderId FROM message WHERE chatId = :chatId ORDER BY time DESC ${msgLimit ? 'LIMIT :limit' : ''};`
        )

        return (await statement).all({ ':chatId': chatId, ':limit': msgLimit})
    }

    
    async getUserIdsFromChat(chatId: number, msgLimit: number) {
        
        const statement = (await this.dbQuery()).prepare(
            `SELECT DISTINCT senderId FROM message WHERE chatId = :chatId ORDER BY time DESC ${msgLimit ? 'LIMIT :limit' : ''};`
        )

        return (await statement).all({ ':chatId': chatId, ':limit': msgLimit })
    }


    // async getLastTextByUserChat(chatId: number, userSearch: string) {
        
    //     const statement = (await this.dbQuery()).prepare(
    //         `SELECT mes.text FROM message AS mes 
    //         LEFT JOIN user ON (mes.senderId = user.id AND mes.chatId = user.chatId)  
    //         WHERE mes.senderId = :senderId
    //         ORDER BY datetime(time)
    //         DESC ${msgLimit ? 'LIMIT :limit' : ''};`
    //     )

    //     return (await statement).all({ ':chatId': chatId, ':limit': msgLimit})
    // }
    

    
    async addMessageToDatabase(msg: DataMessage) {

        (await this.dbQuery()).run('INSERT INTO message(id, chatId, senderId, time, text) VALUES (:id, :chatId, :senderId, :time, :text);', {
            ':id': (Math.abs(msg.chatId) + msg.id), 
            ':chatId': msg.chatId, 
            ':senderId': msg.senderId, 
            ':time': msg.date, 
            ':text': msg.text
        })
    }

    async addUserToDatabase(user: User, chatId: number) {
        
        (await this.dbQuery()).run(
            `INSERT INTO user(id, chatId, first_name, last_name, username) VALUES (:id, :chatId, :first_name, :username)
            ON CONFLICT(id) DO UPDATE SET
            chatId=excluded.chatId
            first_name=excluded.first_name
            last_name=excluded.last_name
            username=excluded.username;`,
        {
            ':id': user.id, 
            ':chatId': chatId, 
            ':first_name': user.first_name, 
            ':last_name': user.last_name, 
            ':username': user.username, 
        })
    }

}


