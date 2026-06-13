def calculate_concrete_and_steel():
    print("--- حاسبة كميات وتكلفة خرسانة وحديد القواعد ---")
    
    # 1. إدخال بيانات الخرسانة
    length = float(input("أدخل طول القاعدة (بالمتر): "))
    width = float(input("أدخل عرض القاعدة (بالمتر): "))
    depth = float(input("أدخل سمك/ارتفاع القاعدة (بالمتر): "))
    number_of_footings = int(input("أدخل إجمالي عدد القواعد: "))
    concrete_price_per_m3 = float(input("أدخل سعر المتر المكعب للخرسانة (بالعملة المحلية): "))
    
    # 2. إدخال بيانات حديد التسليح
    # معدل استهلاك الحديد الافتراضي في القواعد هو 80 كجم/متر مكعب
    steel_ratio = float(input("أدخل معدل حديد التسليح (كجم لكل متر مكعب خرسانة - الافتراضي 80): ") or "80")
    steel_price_per_ton = float(input("أدخل سعر طن الحديد (بالعملة المحلية): "))
    
    # 3. الحسابات الإنشائية
    volume_per_footing = length * width * depth
    total_concrete_volume = volume_per_footing * number_of_footings
    total_concrete_cost = total_concrete_volume * concrete_price_per_m3
    
    # حسابات الحديد (تحويل الكيلوجرام إلى طن)
    total_steel_weight_kg = total_concrete_volume * steel_ratio
    total_steel_weight_tons = total_steel_weight_kg / 1000
    total_steel_cost = total_steel_weight_tons * steel_price_per_ton
    
    # إجمالي تكلفة المواد
    total_project_cost = total_concrete_cost + total_steel_cost
    
    # 4. طباعة النتائج الهندسية
    print("\n" + "="*40)
    print(f" إجمالي حجم الخرسانة المطلوبة: {total_concrete_volume:.2f} متر مكعب")
    print(f" إجمالي وزن حديد التسليح المطلوب: {total_steel_weight_tons:.3f} طن ({total_steel_weight_kg:.2f} كجم)")
    print("-"*40)
    print(f" تكلفة الخرسانة التقديرية: {total_concrete_cost:.2f}")
    print(f" تكلفة حديد التسليح التقديرية: {total_steel_cost:.2f}")
    print(f" إجمالي تكلفة المواد (خرسانة + حديد): {total_project_cost:.2f}")
    print("="*40)

if __name__ == "__main__":
    calculate_concrete_and_steel()
