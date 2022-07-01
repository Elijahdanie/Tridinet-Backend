import { Column, ForeignKey, IsUUID, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import Users from "./users";

@Table({timestamps:true})
export default class Repository extends Model<Repository> {

    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @Unique
    @Column
    name: string;

    @Column
    description: string;

    @Column
    previewUrl: string;

    @Column
    manifestUrl: string;

    @Column
    cost: number;

    @Column
    category: string;

    @ForeignKey(()=>Users)
    @PrimaryKey
    @Column
    userId: string;
}

