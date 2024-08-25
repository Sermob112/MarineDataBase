import pandas as pd

def convert_xlsx_to_csv(xlsx_file_path, csv_file_path):
    df = pd.read_excel(xlsx_file_path)
    df.fillna(0, inplace=True)
    df.to_csv(csv_file_path, index=False)

if __name__ == "__main__":
    xlsx_file = 'db_river.xlsx'  # Путь к исходному xlsx файлу
    csv_file = 'db_river.csv'   # Путь к результирующему csv файлу
    
    convert_xlsx_to_csv(xlsx_file, csv_file)
    print(f"Файл {xlsx_file} успешно преобразован в {csv_file}")