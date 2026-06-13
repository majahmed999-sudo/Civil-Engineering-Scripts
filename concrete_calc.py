def calculate_concrete_cost():
    print("--- حاسبة كميات وتكلفة خرسانة القواعد ---")
    
    # إدخال الأبعاد والأعداد
    length = float(input("أدخل طول القاعدة (بالمتر): "))
    width = float(input("أدخل عرض القاعدة (بالمتر): "))
    depth = float(input("أدخل سمك/ارتفاع القاعدة (بالمتر): "))
    number_of_footings = int(input("أدخل إجمالي عدد القواعد: "))
    price_per_m3 = float(input("أدخل سعر المتر المكعب للخرسانة (بالعملة المحلية): "))
    
    # الحسابات
    volume_per_footing = length * width * depth
    total_volume = volume_per_footing * number_of_footings
    total_cost = total_volume * price_per_m3
    
    # طباعة النتائج
    print("\n" + "="*30)
    print(f" حجم الخرسانة للقاعدة الواحدة: {volume_per_footing:.2f} متر مكعب")
    print(f" إجمالي حجم الخرسانة المطلوبة: {total_volume:.2f} متر مكعب")
    print(f" إجمالي التكلفة التقديرية: {total_cost:.2f}")
    print("="*30)

# تشغيل السكربت
if __name__ == "__main__":
    calculate_concrete_cost()
