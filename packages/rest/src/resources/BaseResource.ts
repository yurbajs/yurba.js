import { REST } from '../index';

/**
 * Base class for all resources
 * @ignore
 */
export abstract class BaseResource {
  /**
   * @ignore
   */
  constructor(protected client: REST) {}

  /**
   * Validates ID parameter
   * @param id - ID to validate
   * @param name - Parameter name for error message
   * @throws {Error} If ID is invalid
   */
  protected validateId(id: number, name: string = 'ID'): void {
    if (id < 1) throw new Error(`Invalid ${name}`);
  }

  /**
   * Validates string parameter
   * @param str - String to validate
   * @param name - Parameter name for error message
   * @param maxLength - Maximum allowed length
   * @throws {Error} If string is invalid
   */
  protected validateString(str: string, name: string = 'string', maxLength: number = 255): void {
    if (!str || str.length > maxLength) throw new Error(`Invalid ${name}`);
  }

  /**
   * Validates page parameter
   * @param page - Page number to validate
   * @throws {Error} If page is invalid
   */
  protected validatePage(page: number): void {
    if (page < 0) throw new Error('Invalid page number');
  }

  /**
   * Validates required parameter
   * @param value - Value to validate
   * @param name - Parameter name for error message
   * @throws {Error} If value is invalid
   */
  protected validateRequired(value: any, name: string): void {
    if (!value) throw new Error(`${name} is required`);
  }
}