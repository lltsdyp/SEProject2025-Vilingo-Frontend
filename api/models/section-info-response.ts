// tslint:disable
/**
 * Vilingo
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { ChapterInfoResponse } from './chapter-info-response';

/**
 * 
 * @export
 * @interface SectionInfoResponse
 */
export interface SectionInfoResponse {
    /**
     * 章节id
     * @type {number}
     * @memberof SectionInfoResponse
     */
    id: number;
    /**
     * 章节标题
     * @type {string}
     * @memberof SectionInfoResponse
     */
    title: string;
    /**
     * 当前章节包含的所有段落id
     * @type {Array<ChapterInfoResponse>}
     * @memberof SectionInfoResponse
     */
    chapters: Array<ChapterInfoResponse>;
}


